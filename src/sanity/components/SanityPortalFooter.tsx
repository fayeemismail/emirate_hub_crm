'use client';

import React from 'react';
import { SanityFooter } from '../types/documents';
import { isValidFooter } from '../types/typeGuards';

interface SanityPortalFooterProps {
  footer: SanityFooter | null;
  companyName?: string;
}

export const SanityPortalFooter: React.FC<SanityPortalFooterProps> = ({
  footer,
  companyName,
}) => {
  const hasCms = isValidFooter(footer);
  const brand = companyName?.trim() || 'Emirate Hub';
  const year = new Date().getFullYear();

  const line =
    (hasCms && footer.portalFooterText?.trim()) ||
    (hasCms && footer.tagline?.trim()) ||
    'CRM for leads and client inquiries';

  const copyright =
    (hasCms && footer.copyright?.trim()) ||
    `© ${year} ${brand}`;

  return (
    <footer
      className="mt-auto border-t"
      style={{
        backgroundColor: 'var(--sanity-header-bg, #FFFFFF)',
        borderColor: 'var(--sanity-sidebar-border, #E7E5E4)',
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--sanity-text-primary, #1C1917)' }}
          >
            {brand}
          </p>
          <p className="mt-0.5 text-sm" style={{ color: '#78716C' }}>
            {line}
          </p>
        </div>
        <p className="shrink-0 text-sm tabular-nums" style={{ color: '#A8A29E' }}>
          {copyright}
        </p>
      </div>
    </footer>
  );
};
