'use client';

import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASS = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-lg',
  lg: 'h-14 w-14 text-2xl',
} as const;

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'sm', className = '' }) => {
  return (
    <div
          className={`inline-flex shrink-0 items-center justify-center rounded-xl font-mono font-bold tracking-tight text-white ${SIZE_CLASS[size]} ${className}`}
      style={{
        backgroundColor: 'var(--crm-accent-primary, #E02126)',
      }}
      aria-hidden
    >
      E
    </div>
  );
};
