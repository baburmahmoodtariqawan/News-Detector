import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Clock, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset, onToggleHistory, historyCount }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark in display face */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-85 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm"
          >
            Veritas
          </button>
        </div>

        {/* Zone 2: Navigation / Quick contextual actions */}
        <div className="flex items-center gap-2">
          {historyCount > 0 && (
            <button
              type="button"
              onClick={onToggleHistory}
              aria-label="View recent research history"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-300/60 dark:hover:border-slate-700/60"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {historyCount}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            aria-label="Start new research"
            title="Clear and start new research"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-300/60 dark:hover:border-slate-700/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Query</span>
          </button>

          {/* Zone 3: Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
