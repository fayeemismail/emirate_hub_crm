'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const ROUND: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  style,
  rounded = 'lg',
}) => (
  <div
    className={`animate-pulse ${ROUND[rounded]} ${className}`}
    style={{
      backgroundColor: '#F5F5F4',
      ...style,
    }}
    aria-hidden
  />
);

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 2, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-3"
        style={{ width: i === lines - 1 && lines > 1 ? '66%' : '100%' }}
        rounded="md"
      />
    ))}
  </div>
);

export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => (
  <Skeleton
    className={`shrink-0 ${className}`}
    rounded="full"
    style={{ width: size, height: size }}
  />
);
