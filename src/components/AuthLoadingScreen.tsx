'use client';

import React from 'react';
import { AppShellSkeleton } from './ui/loading';

interface AuthLoadingScreenProps {
  message?: string;
}

/** Session bootstrap — full CRM chrome skeleton, not a blank spinner page. */
export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = 'Checking your session…',
}) => {
  return (
    <div className="relative">
      <AppShellSkeleton />
      <div
        className="pointer-events-none absolute inset-x-0 flex justify-center"
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div
          className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E7E5E4',
            color: '#78716C',
            boxShadow: '0 8px 24px rgba(28, 25, 23, 0.08)',
          }}
          role="status"
          aria-live="polite"
        >
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ backgroundColor: '#E02126' }}
            aria-hidden
          />
          {message}
        </div>
      </div>
    </div>
  );
};
