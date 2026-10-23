import React from 'react';
import { ResearchResult } from '../types';
import { X, Trash2, ArrowUpRight, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ResearchResult[];
  onSelectResult: (result: ResearchResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#131B26] border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col z-10 transition-transform duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Research History
            </h3>
            <span className="font-mono text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                aria-label="Clear all research history"
                title="Clear all research history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              No previous research sessions recorded.
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectResult(item);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#1A2332]/50 hover:bg-slate-100/70 dark:hover:bg-[#1A2332] transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {item.inputType}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {item.headline}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.querySummary}
                </p>
                <div className="mt-2 flex items-center justify-end text-[11px] text-blue-600 dark:text-blue-400 font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Restore query</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
