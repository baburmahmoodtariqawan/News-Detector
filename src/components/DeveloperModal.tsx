import React, { useEffect, useRef } from 'react';
import { X, User } from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const DEVELOPERS = [
  {
    name: 'BABUR MAHMOOD TARIQ',
    role: 'Lead Systems & Architecture',
    focus: 'Multi-modal pipelines, bridge orchestration & performance'
  },
  {
    name: 'AMNA MANZOOR',
    role: 'Research & Verification Engine',
    focus: 'Cross-source corroboration heuristics & factual synthesis'
  },
  {
    name: 'HUZAIFA TAYYAB',
    role: 'Forensics & Media Processing',
    focus: 'Image EXIF extraction, synthetic detection & audio STT'
  },
  {
    name: 'SAAD WAHEED',
    role: 'Interface & User Experience',
    focus: 'Accessible design, dark mode architecture & interaction flows'
  }
];

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose, triggerRef }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore later
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Focus close button initially
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Return focus to trigger
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="developer-modal-title"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-white dark:bg-[#131B26] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 sm:p-7 z-10 max-h-[90vh] overflow-y-auto transition-transform duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2
              id="developer-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white tracking-tight"
            >
              Meet the Team
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Engineering behind the Veritas research platform
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Developer List */}
        <div className="mt-5 space-y-3">
          {DEVELOPERS.map((dev) => (
            <div
              key={dev.name}
              className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#192333] border border-slate-200/70 dark:border-slate-800/80 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-sm tracking-wide text-slate-900 dark:text-slate-100">
                      {dev.name}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {dev.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {dev.focus}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtitle / Footer inside modal */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Built as a final project — Veritas v1.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
