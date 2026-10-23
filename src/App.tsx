/**
 * Veritas — Multi-modal Context & Verification Research Application
 */

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { InputTabs } from './components/InputTabs';
import { TextInput } from './components/inputs/TextInput';
import { ImageInput } from './components/inputs/ImageInput';
import { UrlInput } from './components/inputs/UrlInput';
import { VoiceInput } from './components/inputs/VoiceInput';
import { ResultCard } from './components/ResultCard';
import { LoadingState } from './components/LoadingState';
import { Footer } from './components/Footer';
import { DeveloperModal } from './components/DeveloperModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  InputMode,
  ResearchResult
} from './types';
import { executeResearch, ResearchEngineError } from './services/researchEngine';
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_HISTORY_KEY = 'veritas_history_cache';

export default function App() {
  const [activeMode, setActiveMode] = useState<InputMode>('text');

  // Input States
  const [textQuery, setTextQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);

  // App Execution States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ResearchResult | null>(null);

  // Modal & History States
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ResearchResult[]>([]);
  const devButtonRef = useRef<HTMLButtonElement>(null);

  // Load cached history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const saveHistory = (newResult: ResearchResult) => {
    setHistory((prev) => {
      const updated = [newResult, ...prev.filter((item) => item.id !== newResult.id)].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch {}
  };

  const resetAll = () => {
    setTextQuery('');
    setUrlInput('');
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setVoiceTranscript('');
    setError(null);
    setCurrentResult(null);
  };

  const handleModeChange = (mode: InputMode) => {
    setActiveMode(mode);
    setError(null);
  };

  const handleAnalyze = async () => {
    setError(null);

    // Validate active tab input before dispatching
    if (activeMode === 'text' && !textQuery.trim()) {
      setError('Please enter a query or claim to analyze.');
      return;
    }
    if (activeMode === 'url' && !urlInput.trim()) {
      setError('Please provide an article URL to analyze.');
      return;
    }
    if (activeMode === 'image' && !imageFile && !imagePreviewUrl) {
      setError('Please select or upload an image to analyze.');
      return;
    }
    if (activeMode === 'voice' && !voiceTranscript.trim()) {
      setError("Please speak into the microphone or upload an audio file first.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await executeResearch({
        mode: activeMode,
        query: activeMode === 'text' ? textQuery : undefined,
        url: activeMode === 'url' ? urlInput : undefined,
        imageFile: activeMode === 'image' && imageFile ? imageFile : undefined,
        imageUrl: activeMode === 'image' && imagePreviewUrl ? imagePreviewUrl : undefined,
        transcript: activeMode === 'voice' ? voiceTranscript : undefined
      });

      setCurrentResult(result);
      saveHistory(result);

      // Smooth scroll to result
      setTimeout(() => {
        window.scrollTo({
          top: 360,
          behavior: 'smooth'
        });
      }, 100);
    } catch (err: any) {
      if (err instanceof ResearchEngineError) {
        setError(err.message);
      } else {
        setError("We couldn't complete the research right now. Please try again in a moment.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#E2E8F0] transition-colors duration-200">
        {/* Navigation Bar */}
        <Navbar
          onReset={resetAll}
          onToggleHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          {/* Hero Header */}
          <section className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Investigate &amp; Understand Context
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Submit text claims, photographs, web articles, or spoken questions. Veritas returns an informative,
              detailed explanation backed by verifiable source citations.
            </p>
          </section>

          {/* Input Panel Card */}
          <section className="w-full bg-white dark:bg-[#131B26] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6 transition-colors">
            {/* Four Tabs: Text · Image · URL · Voice */}
            <InputTabs
              activeMode={activeMode}
              onSelectMode={handleModeChange}
              disabled={isLoading || isTranscribingVoice}
            />

            {/* Tab Specific Content */}
            <div className="pt-2">
              {activeMode === 'text' && (
                <TextInput
                  value={textQuery}
                  onChange={(val) => {
                    setTextQuery(val);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                />
              )}

              {activeMode === 'image' && (
                <ImageInput
                  selectedFile={imageFile}
                  previewUrl={imagePreviewUrl}
                  onFileSelect={(file, url) => {
                    setImageFile(file);
                    setImagePreviewUrl(url);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                />
              )}

              {activeMode === 'url' && (
                <UrlInput
                  value={urlInput}
                  onChange={(val) => {
                    setUrlInput(val);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                />
              )}

              {activeMode === 'voice' && (
                <VoiceInput
                  transcript={voiceTranscript}
                  onTranscriptChange={(text) => {
                    setVoiceTranscript(text);
                    if (error) setError(null);
                  }}
                  onError={(err) => setError(err)}
                  isTranscribing={isTranscribingVoice}
                  setIsTranscribing={setIsTranscribingVoice}
                  disabled={isLoading}
                />
              )}
            </div>

            {/* Error Message Notice (Brand-neutral & Graceful) */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="font-medium underline hover:text-rose-900 dark:hover:text-rose-100 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Single Prominent Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading || isTranscribingVoice}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Loading Indicator */}
          {isLoading && <LoadingState />}

          {/* Research Result Presentation */}
          {!isLoading && currentResult && (
            <section aria-label="Research Findings">
              <ResultCard result={currentResult} />
            </section>
          )}
        </main>

        {/* Footer with exact mandated disclaimer and developer trigger */}
        <Footer
          onOpenDevelopers={() => setIsDevModalOpen(true)}
          developerButtonRef={devButtonRef}
        />

        {/* Developer Modal */}
        <DeveloperModal
          isOpen={isDevModalOpen}
          onClose={() => setIsDevModalOpen(false)}
          triggerRef={devButtonRef}
        />

        {/* History Drawer */}
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectResult={(res) => {
            setCurrentResult(res);
            setActiveMode(res.inputType);
          }}
          onClearHistory={handleClearHistory}
        />
      </div>
    </ThemeProvider>
  );
}
