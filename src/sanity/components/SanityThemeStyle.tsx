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

  const isCustomTop = Boolean(themeSettings.bgGradientTop && themeSettings.bgGradientTop.toLowerCase() !== '#081d39');
  const isCustomMain = Boolean(themeSettings.bgMain && themeSettings.bgMain.toLowerCase() !== '#07172e');

  let pageBg = 'linear-gradient(180deg, #081d39 0%, #0b2548 40%, #061326 100%)';
  if (isCustomTop) {
    pageBg = `linear-gradient(180deg, ${themeSettings.bgGradientTop} 0%, ${themeSettings.bgGradientMiddle || themeSettings.bgGradientTop} 40%, ${themeSettings.bgGradientBottom || themeSettings.bgGradientTop} 100%)`;
  } else if (isCustomMain && themeSettings.bgMain) {
    pageBg = themeSettings.bgMain;
  } else if (themeSettings.bgGradientTop) {
    pageBg = `linear-gradient(180deg, ${themeSettings.bgGradientTop} 0%, ${themeSettings.bgGradientMiddle || themeSettings.bgGradientTop} 40%, ${themeSettings.bgGradientBottom || themeSettings.bgGradientTop} 100%)`;
  }

  const cssVariables = `
    :root {
      --sanity-page-bg: ${pageBg};
      ${themeSettings.bgMain ? `--sanity-bg-main: ${themeSettings.bgMain};` : ''}
      ${themeSettings.bgGradientTop ? `--sanity-bg-top: ${themeSettings.bgGradientTop};` : ''}
      ${themeSettings.bgGradientMiddle ? `--sanity-bg-mid: ${themeSettings.bgGradientMiddle};` : ''}
      ${themeSettings.bgGradientBottom ? `--sanity-bg-bot: ${themeSettings.bgGradientBottom};` : ''}
      ${themeSettings.headerBg ? `--sanity-header-bg: ${themeSettings.headerBg};` : ''}
      ${themeSettings.cardBg ? `--sanity-card-bg: ${themeSettings.cardBg};` : ''}
      ${themeSettings.cardBorder ? `--sanity-card-border: ${themeSettings.cardBorder};` : ''}
      ${themeSettings.cardHoverBorder ? `--sanity-card-hover-border: ${themeSettings.cardHoverBorder};` : ''}
      ${themeSettings.innerCardBg ? `--sanity-inner-card-bg: ${themeSettings.innerCardBg};` : ''}
      ${themeSettings.sidebarBgStart ? `--sanity-sidebar-start: ${themeSettings.sidebarBgStart};` : ''}
      ${themeSettings.sidebarBgMiddle ? `--sanity-sidebar-mid: ${themeSettings.sidebarBgMiddle};` : ''}
      ${themeSettings.sidebarBgEnd ? `--sanity-sidebar-end: ${themeSettings.sidebarBgEnd};` : ''}
      ${themeSettings.sidebarBorder ? `--sanity-sidebar-border: ${themeSettings.sidebarBorder};` : ''}
      ${themeSettings.sidebarActiveItemBgStart ? `--sanity-sidebar-active-start: ${themeSettings.sidebarActiveItemBgStart};` : ''}
      ${themeSettings.sidebarActiveItemBgEnd ? `--sanity-sidebar-active-end: ${themeSettings.sidebarActiveItemBgEnd};` : ''}
      ${themeSettings.textPrimary ? `--sanity-text-primary: ${themeSettings.textPrimary};` : ''}
      ${themeSettings.textSecondary ? `--sanity-text-secondary: ${themeSettings.textSecondary};` : ''}
      ${themeSettings.textMuted ? `--sanity-text-muted: ${themeSettings.textMuted};` : ''}
      ${themeSettings.accentPrimary ? `--sanity-accent-primary: ${themeSettings.accentPrimary};` : ''}
      ${themeSettings.accentSky ? `--sanity-accent-sky: ${themeSettings.accentSky};` : ''}
      ${themeSettings.successColor ? `--sanity-success: ${themeSettings.successColor};` : ''}
      ${themeSettings.warningColor ? `--sanity-warning: ${themeSettings.warningColor};` : ''}
      ${themeSettings.dangerColor ? `--sanity-danger: ${themeSettings.dangerColor};` : ''}
      ${themeSettings.primaryButtonBg ? `--sanity-btn-primary-bg: ${themeSettings.primaryButtonBg};` : ''}
      ${themeSettings.primaryButtonHover ? `--sanity-btn-primary-hover: ${themeSettings.primaryButtonHover};` : ''}
      ${themeSettings.primaryButtonTxt ? `--sanity-btn-primary-txt: ${themeSettings.primaryButtonTxt};` : ''}
      ${themeSettings.secondaryButtonBg ? `--sanity-btn-sec-bg: ${themeSettings.secondaryButtonBg};` : ''}
      ${themeSettings.secondaryButtonTxt ? `--sanity-btn-sec-txt: ${themeSettings.secondaryButtonTxt};` : ''}
      ${themeSettings.pillBg ? `--sanity-pill-bg: ${themeSettings.pillBg};` : ''}
      ${themeSettings.pillBorder ? `--sanity-pill-border: ${themeSettings.pillBorder};` : ''}
      ${themeSettings.pillTxtColor ? `--sanity-pill-txt: ${themeSettings.pillTxtColor};` : ''}
      ${themeSettings.priorityHighBg ? `--sanity-priority-high-bg: ${themeSettings.priorityHighBg};` : ''}
      ${themeSettings.priorityHighColor ? `--sanity-priority-high-color: ${themeSettings.priorityHighColor};` : ''}
      ${themeSettings.priorityMediumBg ? `--sanity-priority-med-bg: ${themeSettings.priorityMediumBg};` : ''}
      ${themeSettings.priorityMediumColor ? `--sanity-priority-med-color: ${themeSettings.priorityMediumColor};` : ''}
      ${themeSettings.priorityLowBg ? `--sanity-priority-low-bg: ${themeSettings.priorityLowBg};` : ''}
      ${themeSettings.priorityLowColor ? `--sanity-priority-low-color: ${themeSettings.priorityLowColor};` : ''}
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
  );
};
