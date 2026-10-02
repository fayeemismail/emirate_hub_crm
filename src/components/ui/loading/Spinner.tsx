'use client';

import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE: Record<SpinnerSize, string> = {
  xs: 'h-3.5 w-3.5 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[2.5px]',
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'sm',
  className = '',
  color = 'var(--crm-accent-primary, #E02126)',
  label,
}) => (
  <span
    role="status"
    aria-label={label || 'Loading'}
    className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${SIZE[size]} ${className}`}
    style={{ borderColor: color, borderTopColor: 'transparent' }}
  />
);
