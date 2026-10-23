import React from 'react';
import { InputMode } from '../types';
import { Type, Image as ImageIcon, Link as LinkIcon, Mic } from 'lucide-react';

interface InputTabsProps {
  activeMode: InputMode;
  onSelectMode: (mode: InputMode) => void;
  disabled?: boolean;
}

const TABS: { id: InputMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'url', label: 'URL', icon: LinkIcon },
  { id: 'voice', label: 'Voice', icon: Mic }
];

export const InputTabs: React.FC<InputTabsProps> = ({ activeMode, onSelectMode, disabled }) => {
  return (
    <div className="w-full flex items-center justify-center">
      <div
        role="tablist"
        aria-label="Input formats"
        className="inline-flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900/90 rounded-xl border border-slate-300/60 dark:border-slate-800 transition-colors"
      >
        {TABS.map((tab) => {
          const isActive = activeMode === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              disabled={disabled}
              onClick={() => onSelectMode(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                isActive
                  ? 'bg-white dark:bg-[#1A2332] text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
