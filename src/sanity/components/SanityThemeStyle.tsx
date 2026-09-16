'use client';

import React from 'react';
import { SanityThemeSettings } from '../types/documents';
import { isValidThemeSettings } from '../types/typeGuards';

interface SanityThemeStyleProps {
  themeSettings: SanityThemeSettings | null;
}

/**
 * Injects dynamic CSS variables ONLY when valid themeSettings data is incoming from Sanity CMS.
 * If no themeSettings data exists, renders nothing and lets base styles apply without mock defaults.
 */
export const SanityThemeStyle: React.FC<SanityThemeStyleProps> = ({ themeSettings }) => {
  if (!isValidThemeSettings(themeSettings)) {
    return null;
  }

  const cssVariables = `
    :root {
      ${themeSettings.bgMain ? `--sanity-bg-main: ${themeSettings.bgMain};` : ''}
      ${themeSettings.bgGradientTop ? `--sanity-bg-top: ${themeSettings.bgGradientTop};` : ''}
      ${themeSettings.bgGradientMiddle ? `--sanity-bg-mid: ${themeSettings.bgGradientMiddle};` : ''}
      ${themeSettings.bgGradientBottom ? `--sanity-bg-bot: ${themeSettings.bgGradientBottom};` : ''}
      ${themeSettings.headerBg ? `--sanity-header-bg: ${themeSettings.headerBg};` : ''}
      ${themeSettings.cardBg ? `--sanity-card-bg: ${themeSettings.cardBg};` : ''}
      ${themeSettings.cardBorder ? `--sanity-card-border: ${themeSettings.cardBorder};` : ''}
      ${themeSettings.sidebarBgStart ? `--sanity-sidebar-start: ${themeSettings.sidebarBgStart};` : ''}
      ${themeSettings.sidebarBgEnd ? `--sanity-sidebar-end: ${themeSettings.sidebarBgEnd};` : ''}
      ${themeSettings.accentPrimary ? `--sanity-accent-primary: ${themeSettings.accentPrimary};` : ''}
      ${themeSettings.accentSky ? `--sanity-accent-sky: ${themeSettings.accentSky};` : ''}
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
  );
};
