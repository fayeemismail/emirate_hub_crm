'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Wider forms (e.g. two-column). Default sm. */
  size?: 'sm' | 'md';
  /** When true, backdrop/Escape won't close (e.g. while saving). */
  busy?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'sm',
  busy = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, busy]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 crm-modal-backdrop"
      style={{ backgroundColor: 'rgba(28, 25, 23, 0.28)' }}
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className={`w-full max-h-[92vh] sm:max-h-none overflow-y-auto rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 crm-modal-panel border-t sm:border-t-0 shadow-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))] ${
          size === 'md' ? 'max-w-lg' : 'max-w-md'
        }`}
        style={{
          backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
          borderColor: 'var(--crm-border-subtle, #E7E5E4)',
          boxShadow: '0 16px 40px rgba(28, 25, 23, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-300 dark:bg-stone-600 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              id="form-modal-title"
              className="text-base font-semibold tracking-tight"
              style={{ color: 'var(--crm-text-primary, #1C1917)' }}
            >
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed" style={{ color: '#78716C' }}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="crm-interactive shrink-0 rounded-lg p-1.5 cursor-pointer disabled:opacity-40"
            style={{ color: '#A8A29E' }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
