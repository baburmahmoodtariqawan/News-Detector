import React from 'react';
import { ResearchResult } from '../types';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Volume2,
  Copy,
  Check
} from 'lucide-react';

interface ResultCardProps {
  result: ResearchResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    const textToCopy = `${result.headline}\n\n${result.explanation}\n\nSources:\n${result.sources.map((s) => `- ${s.title}: ${s.url}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status visual accents - theme-aware variants (WCAG AA compliant)
  // Subtle surface background tint + border tint, without asymmetric thick border-l-4
  const statusStyles = {
    corroborated: {
      border: 'border-emerald-200 dark:border-emerald-900/60',
      bgHeader: 'bg-emerald-50/70 dark:bg-emerald-950/25',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />,
      tag: 'text-emerald-800 dark:text-emerald-300',
      badgeBg: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
    },
    unclear: {
      border: 'border-amber-200 dark:border-amber-900/60',
      bgHeader: 'bg-amber-50/70 dark:bg-amber-950/25',
      icon: <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />,
      tag: 'text-amber-800 dark:text-amber-300',
      badgeBg: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
    },
    contradicted: {
      border: 'border-rose-200 dark:border-rose-900/60',
      bgHeader: 'bg-rose-50/70 dark:bg-rose-950/25',
      icon: <XCircle className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0" />,
      tag: 'text-rose-800 dark:text-rose-300',
      badgeBg: 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
    }
  }[result.status];

  return (
    <div
      className={`w-full rounded-xl border ${statusStyles.border} bg-white dark:bg-[#131B26] shadow-sm transition-colors duration-200 overflow-hidden`}
    >
      {/* 1. Header with Short Finding Headline */}
      <div className={`p-5 sm:p-6 ${statusStyles.bgHeader} border-b ${statusStyles.border}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{statusStyles.icon}</div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                {result.headline}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="capitalize">{result.inputType} inquiry</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={copyToClipboard}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            title="Copy research summary"
            aria-label="Copy research summary"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* 2. For Voice: Transcript shown above the answer */}
        {result.inputType === 'voice' && result.transcript && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#1A2332] border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Transcribed Speech</span>
            </div>
            <p className="text-sm font-sans text-slate-800 dark:text-slate-200 italic">
              "{result.transcript}"
            </p>
          </div>
        )}

        {/* 3. For Images: Clear label ('Looks real' / 'Likely AI-generated' / 'Unclear') + metadata findings */}
        {result.inputType === 'image' && result.imageAssessment && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#1A2332] border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Image Authenticity Assessment:
                </span>
              </div>

              {/* Required exact labels: "Looks real" / "Likely AI-generated" / "Unclear" */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold ${
                  result.imageAssessment.label === 'Looks real'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : result.imageAssessment.label === 'Likely AI-generated'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                {result.imageAssessment.label === 'Looks real' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : result.imageAssessment.label === 'Likely AI-generated' ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                <span>{result.imageAssessment.label}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.imageAssessment.reasoning}
            </div>

            {/* Technical metadata specifics */}
            {result.imageAssessment.technicalIndicators.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                {result.imageAssessment.technicalIndicators.map((ind, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Detailed Explanation (AI-generated answer displayed as-is in plain prose) */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Detailed Explanation
          </h4>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line">
            {result.explanation}
          </p>
        </div>

        {/* 5. Sources Section: Clickable links drawn from */}
        {result.sources && result.sources.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Sources &amp; Reporting Records
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#1A2332]/50 hover:bg-slate-100/60 dark:hover:bg-[#1A2332] transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {source.title}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {source.domain}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 mt-0.5 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 6. Caveat Line (Required exact wording) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center sm:text-left">
            This is an AI-generated assessment, not a guarantee of truth.
          </p>
        </div>
      </div>
    </div>
  );
};
