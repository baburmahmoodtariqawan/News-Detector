import React from 'react';

interface FooterProps {
  onOpenDevelopers: () => void;
  developerButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDevelopers, developerButtonRef }) => {
  return (
    <footer className="w-full mt-auto py-8 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Mandatory exact footer text */}
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
          Veritas provides AI-generated context. Always verify important information independently.
        </p>

        {/* Subtle developer button / rounded pill */}
        <div className="shrink-0">
          <button
            ref={developerButtonRef}
            type="button"
            onClick={onOpenDevelopers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 rounded-full transition-colors cursor-pointer border border-transparent hover:border-slate-300/60 dark:hover:border-slate-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>Developed by 4 engineers</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
