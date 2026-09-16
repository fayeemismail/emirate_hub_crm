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
      style={{ background: 'linear-gradient(180deg, #081d39 0%, #0b2548 40%, #061326 100%)' }}
    >
      <div className="flex flex-col items-center gap-3" style={{ color: '#bae6fd' }}>
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" 
          style={{ borderColor: '#38bdf8', borderTopColor: 'transparent' }}
        />
        <span className="text-xs font-medium">{message}</span>
      </div>
    </div>
  );
};
