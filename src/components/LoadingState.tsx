import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Researching…',
  subtext = 'Synthesizing contextual records and corroborating sources'
}) => {
  return (
    <div className="w-full p-10 sm:p-14 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B26] shadow-xs flex flex-col items-center justify-center text-center transition-colors">
      <div className="relative mb-4">
        {/* Neutral spinner - no brand colors */}
        <Loader2 className="w-8 h-8 text-slate-700 dark:text-slate-300 animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
        {message}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        {subtext}
      </p>
    </div>
  );
};
