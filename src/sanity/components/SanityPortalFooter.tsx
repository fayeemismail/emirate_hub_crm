'use client';

import React from 'react';
import { SanityFooter } from '../types/documents';
import { isValidFooter } from '../types/typeGuards';
import { SanityFallbackMessage } from './SanityFallbackMessage';

interface SanityPortalFooterProps {
  footer: SanityFooter | null;
}

export const SanityPortalFooter: React.FC<SanityPortalFooterProps> = ({ footer }) => {
  // Check if incoming footer data exists and is valid
  if (!isValidFooter(footer)) {
    return (
      <footer className="px-8 py-4 border-t text-center text-xs">
        <SanityFallbackMessage
          entityName="Portal Footer"
          message="No footer content found in Sanity CMS. Publish the footer document in Sanity Studio to customize this footer."
        />
      </footer>
    );
  }

  const bgColor = footer.footerBgColor || '#061426cc';
  const borderColor = footer.footerBorderColor || '#93c5fd33';
  const textColor = footer.footerTextColor || '#bae6fdb3';

  return (
    <footer 
      className="px-8 py-4 border-t text-center text-xs font-medium space-y-1"
      style={{ 
        backgroundColor: bgColor, 
        borderColor: borderColor,
        color: textColor 
      }}
    >
      <div>{footer.portalFooterText}</div>
      {footer.copyright && (
        <div className="text-[11px] opacity-80">{footer.copyright}</div>
      )}
    </footer>
  );
};
