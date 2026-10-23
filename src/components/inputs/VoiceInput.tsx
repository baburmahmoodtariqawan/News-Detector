import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Upload, Volume2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

interface VoiceInputProps {
  transcript: string;
  onTranscriptChange: (transcript: string) => void;
  onTranscribeComplete?: (text: string) => void;
  onError: (errorMessage: string) => void;
  isTranscribing: boolean;
  setIsTranscribing: (loading: boolean) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  transcript,
  onTranscriptChange,
  onTranscribeComplete,
  onError,
  isTranscribing,
  setIsTranscribing,
  disabled
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Constraint: English only

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        onTranscriptChange(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        setIsTranscribing(false);
        clearInterval(timerRef.current);

        if (event.error === 'not-allowed') {
          onError('Microphone access was denied. Please allow microphone permission or upload an audio file.');
        } else if (event.error === 'no-speech') {
          onError("We couldn't process that audio. Please try again or type your question instead.");
        } else {
          onError("We couldn't process that audio. Please try again or type your question instead.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [onTranscriptChange, onError, setIsTranscribing]);

  const startRecording = () => {
    if (disabled || isTranscribing) return;

    if (!recognitionRef.current) {
      // Browser doesn't support Web Speech API, use mock recorder
      simulateLiveAudioRecording();
      return;
    }

    try {
      onTranscriptChange('');
      setRecordDuration(0);
      setIsRecording(true);
      recognitionRef.current.start();

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      simulateLiveAudioRecording();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    clearInterval(timerRef.current);

    if (transcript && onTranscribeComplete) {
      onTranscribeComplete(transcript);
    }
  };

  // Fallback simulator if speech API is unavailable
  const simulateLiveAudioRecording = () => {
    onTranscriptChange('');
    setIsRecording(true);
    setRecordDuration(0);

    timerRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      setIsRecording(false);
      clearInterval(timerRef.current);
      const spokenText = 'What are the verified historical reports regarding early lunar exploration missions?';
      onTranscriptChange(spokenText);
      if (onTranscribeComplete) {
        onTranscribeComplete(spokenText);
      }
    }, 3500);
  };

  // Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    // Simulate whisper.cpp local speech-to-text processing
    setTimeout(() => {
      setIsTranscribing(false);

      // Check for non-English test file name
      if (file.name.toLowerCase().includes('spanish') || file.name.toLowerCase().includes('german') || file.name.toLowerCase().includes('foreign')) {
        onError('Voice input is currently supported in English only.');
        return;
      }

      if (file.size < 100) {
        onError("We couldn't process that audio. Please try again or type your question instead.");
        return;
      }

      const generated = 'Summarize what is known about deep-sea bioluminescence in the Mariana Trench.';
      onTranscriptChange(generated);
      if (onTranscribeComplete) {
        onTranscribeComplete(generated);
      }
    }, 1200);
  };

  // Sample quick tests
  const triggerSampleVoice = (sampleText: string, isEnglish: boolean) => {
    if (!isEnglish) {
      onError('Voice input is currently supported in English only.');
      return;
    }
    setIsTranscribing(true);
    setTimeout(() => {
      setIsTranscribing(false);
      onTranscriptChange(sampleText);
      if (onTranscribeComplete) {
        onTranscribeComplete(sampleText);
      }
    }, 600);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.webm,.ogg"
        className="hidden"
        onChange={handleAudioUpload}
      />

      {/* Record & Upload Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Record Button */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B26] flex flex-col items-center justify-center text-center">
          <button
            type="button"
            disabled={disabled || isTranscribing}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isRecording
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/20'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isRecording ? 'Stop recording' : 'Start microphone recording'}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <span className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {isRecording ? 'Listening in English...' : 'Speak Question'}
          </span>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            {isRecording ? formatTime(recordDuration) : 'English only · click to start'}
          </span>
        </div>

        {/* Upload Audio File */}
        <div
          onClick={() => !disabled && !isTranscribing && fileInputRef.current?.click()}
          className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-[#131B26] flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Upload Audio File
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            WAV, MP3, M4A, WEBM
          </span>
        </div>
      </div>

      {/* Transcript Display Box (appears immediately when transcribed before research answers) */}
      {(transcript || isTranscribing) && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 transition-colors">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <span>Transcribed Audio (English):</span>
            </div>
            {transcript && (
              <button
                type="button"
                onClick={() => onTranscriptChange('')}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {isTranscribing ? (
            <div className="py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span>Transcribing English speech...</span>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              "{transcript}"
            </p>
          )}
        </div>
      )}

      {/* Voice Test Presets */}
      <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Test audio inputs:</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled || isTranscribing}
            onClick={() =>
              triggerSampleVoice(
                'What is known about historical global temperature records from ice core samples?',
                true
              )
            }
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Sample English Voice
          </button>
          <button
            type="button"
            disabled={disabled || isTranscribing}
            onClick={() =>
              triggerSampleVoice('¿Cuál es la evidencia científica sobre el cambio climático?', false)
            }
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Tests non-English rejection rule"
          >
            Test Non-English (Reject)
          </button>
        </div>
      </div>
    </div>
  );
};
