import React from 'react';
import { Globe, X, ExternalLink } from 'lucide-react';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SAMPLE_URLS = [
  {
    label: 'Reuters: Global Energy Transition Report',
    url: 'https://www.reuters.com/business/energy/clean-grid-infrastructure-2026'
  },
  {
    label: 'Nature: Deep-Sea Biodiversity Discovery',
    url: 'https://www.nature.com/articles/mariana-trench-microbial-ecosystems'
  },
  {
    label: 'Associated Press: Food Supply Logistics',
    url: 'https://apnews.com/article/global-grain-reserves-and-shipping-corridors'
  }
];

export const UrlInput: React.FC<UrlInputProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <Globe className="w-4 h-4" />
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://example.com/news/article-headline"
          className="w-full pl-10 pr-10 py-3.5 text-sm sm:text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-[#131B26] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Clear URL"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested URLs */}
      <div className="pt-1">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Or test with sample article addresses:
        </div>
        <div className="space-y-1.5">
          {SAMPLE_URLS.map((sample) => (
            <button
              key={sample.url}
              type="button"
              disabled={disabled}
              onClick={() => onChange(sample.url)}
              className="w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
            >
              <span className="font-medium truncate">{sample.label}</span>
              <span className="font-mono text-slate-400 text-[11px] shrink-0 flex items-center gap-1">
                <span>use url</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
