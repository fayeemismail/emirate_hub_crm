'use client';

import React from 'react';
import { BrandMark } from './BrandMark';
import { Spinner } from './ui/loading';

interface LoginAuthGateProps {
  message?: string;
}

/**
 * Session check / redirect gate for the login route.
 * Matches the login page chrome — never the CRM app-shell skeleton.
 */
export const LoginAuthGate: React.FC<LoginAuthGateProps> = ({
  message = 'Checking your session…',
}) => {
  return (
    <div
      className="relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden px-4 font-sans"
      style={{
        backgroundColor: '#F7F5F1',
        color: '#1C1917',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -10%, #FEE2E2 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, #F5F5F4 0%, transparent 50%)',
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="crm-fade-enter flex flex-col items-center text-center">
        <BrandMark size="lg" className="mb-5 !h-12 !w-12 !text-xl sm:!h-14 sm:!w-14 sm:!text-2xl" />
        <h1
          className="text-xl font-extrabold uppercase tracking-tight font-mono sm:text-2xl"
          style={{ color: '#1C1917' }}
        >
          emirate hub
        </h1>
        <div
          className="mt-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E7E5E4',
            color: '#78716C',
            boxShadow: '0 8px 24px rgba(28, 25, 23, 0.06)',
          }}
        >
          <Spinner size="xs" color="#E02126" />
          {message}
        </div>
      </div>
    </div>
  );
};
