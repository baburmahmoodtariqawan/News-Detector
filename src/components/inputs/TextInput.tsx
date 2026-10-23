import React from 'react';
import { Sparkles } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  'James Webb telescope detection of early luminous galaxies at cosmic dawn',
  'Global coffee production shifts and climate impacts across Brazil and Vietnam',
  'Commercial quantum computing milestones and algorithmic benchmarks',
  'Microplastics identified in remote marine ecosystems and polar ice cores'
];

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste or type a claim, news report, scientific topic, or question to investigate..."
          className="w-full p-4 text-sm sm:text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-[#131B26] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
        />
        <div className="absolute right-3 bottom-3 text-[11px] font-mono text-slate-400 dark:text-slate-500">
          {value.length} characters
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick exploration examples:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              onClick={() => onChange(prompt)}
              className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
