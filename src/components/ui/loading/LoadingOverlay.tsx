'use client';

import React from 'react';
import { Spinner } from './Spinner';

interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
  className?: string;
}

/** Soft veil over existing content while refreshing — keeps layout stable. */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  label = 'Updating…',
  className = '',
}) => {
  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] ${className}`}
      style={{ backgroundColor: 'rgba(247, 245, 241, 0.55)' }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E7E5E4',
          color: '#78716C',
          boxShadow: '0 4px 16px rgba(28, 25, 23, 0.06)',
        }}
      >
        <Spinner size="xs" />
        <span>{label}</span>
      </div>
    </div>
  );
};
