'use client';

import React from 'react';
import { Spinner } from './ui/loading';

interface AuthLoadingScreenProps {
  message?: string;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = 'Checking your session…',
}) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F7F5F1' }}
    >
      <div className="flex flex-col items-center gap-3" style={{ color: '#78716C' }}>
        <div
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl font-mono text-lg font-bold text-white"
          style={{ backgroundColor: '#E02126' }}
          aria-hidden
        >
          E
        </div>
        <Spinner size="md" />
        <span className="text-xs font-medium">{message}</span>
      </div>
    </div>
  );
};
