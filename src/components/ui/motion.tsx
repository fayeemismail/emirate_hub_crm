'use client';

import React, { useEffect, useState } from 'react';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/** Remounts on `resetKey` so tab/route changes replay the enter animation. */
export function PageEnter({
  children,
  resetKey,
  className,
}: {
  children: React.ReactNode;
  resetKey?: string | number;
  className?: string;
}) {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setAnimating(true);
  }, [resetKey]);

  return (
    <div
      key={resetKey}
      className={cx(animating && 'crm-page-enter', className)}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setAnimating(false);
      }}
    >
      {children}
    </div>
  );
}

/** Single rising fade — use for panels that appear after load. */
export function Enter({
  children,
  className,
  delayMs = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const [animating, setAnimating] = useState(true);

  return (
    <Tag
      className={cx(animating && 'crm-enter', className)}
      style={
        delayMs
          ? ({ ['--crm-stagger' as string]: `${delayMs}ms` } as React.CSSProperties)
          : undefined
      }
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setAnimating(false);
      }}
    >
      {children}
    </Tag>
  );
}

/** Staggered enter for direct children (metrics, chip rows). */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cx('crm-stagger', className)}>{children}</div>;
}

/** Inline success/error strip. */
export function FeedbackEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cx('crm-feedback-enter', className)}>{children}</div>;
}
