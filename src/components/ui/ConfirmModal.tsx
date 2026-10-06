'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Spinner } from './loading';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}) => {
  const [mounted, setMounted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirming(false);
      setError(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isConfirming) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isConfirming]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const confirmBg =
    variant === 'danger'
      ? 'var(--crm-accent-primary, #E02126)'
      : variant === 'info'
        ? 'var(--crm-accent-primary, #E02126)'
        : '#B45309';

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      const messageText =
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong. Try again.';
      setError(messageText);
      setIsConfirming(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden sm:overflow-y-auto crm-modal-backdrop"
      style={{ backgroundColor: 'rgba(28, 25, 23, 0.45)' }}
      onClick={() => {
        if (!isConfirming) onClose();
      }}
    >
      <div
        className="w-full max-w-lg sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 bg-white crm-modal-panel border-t sm:border-t-0 shadow-2xl overscroll-contain"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E7E5E4',
          boxShadow: '0 16px 40px rgba(28, 25, 23, 0.12)',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-300 dark:bg-stone-600 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

        <h3
          className="text-base font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          {title}
        </h3>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: 'var(--crm-text-secondary, #78716C)' }}
        >
          {message}
        </p>
        {error ? (
          <p
            className="mt-3 rounded-lg border px-3 py-2 text-sm"
            style={{
              color: '#B91C1C',
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
            }}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-end sm:gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="crm-interactive w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-sm font-medium cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed border border-stone-200 dark:border-stone-700 sm:border-0"
            style={{ color: 'var(--crm-text-secondary, #78716C)' }}
            onMouseEnter={(e) => {
              if (!isConfirming) e.currentTarget.style.backgroundColor = '#F5F5F4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="crm-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed min-w-[5.5rem]"
            style={{ backgroundColor: confirmBg }}
          >
            {isConfirming ? (
              <>
                <Spinner size="xs" color="#FFFFFF" />
                <span>Working…</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
