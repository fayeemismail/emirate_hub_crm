'use client';

import React from 'react';

interface AuthLoadingScreenProps {
  message?: string;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = 'Authenticating Emirate Hub session...',
}) => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F7F5F1' }}
    >
      <div className="flex flex-col items-center gap-3" style={{ color: '#78716C' }}>
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" 
          style={{ borderColor: '#E02126', borderTopColor: 'transparent' }}
        />
        <span className="text-xs font-medium">{message}</span>
      </div>
    </div>
  );
};
