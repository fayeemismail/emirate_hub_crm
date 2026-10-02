'use client';

import React, { useEffect, useState } from 'react';
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
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirming(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isConfirming) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isConfirming]);

  if (!isOpen) return null;

  const confirmBg =
    variant === 'danger'
      ? 'var(--crm-accent-primary, #E02126)'
      : variant === 'info'
        ? 'var(--crm-accent-primary, #E02126)'
        : '#B45309';

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setIsConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-150"
      style={{ backgroundColor: 'rgba(28, 25, 23, 0.28)' }}
      onClick={() => {
        if (!isConfirming) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
          boxShadow: '0 16px 40px rgba(28, 25, 23, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity cursor-pointer hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed min-w-[5.5rem]"
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
    </div>
  );
};
