'use client';

import React from 'react';
import { SanityThemeSettings } from '../types/documents';
import { CLEAN_CRM_THEME, buildPageBackground } from '../themeDefaults';

interface SanityThemeStyleProps {
  /** Reserved for future CMS overlay once themeSettings is republished with the clean palette. */
  themeSettings: SanityThemeSettings | null;
}

/**
 * Injects the clean CRM theme CSS variables.
 * Uses the shared CLEAN_CRM_THEME baseline so the UI stays consistent without
 * editing dozens of Sanity color fields. Pass-through CMS overlay can be
 * re-enabled after themeSettings is updated in Studio.
 */
export const SanityThemeStyle: React.FC<SanityThemeStyleProps> = () => {
  const t = CLEAN_CRM_THEME;
  const pageBg = buildPageBackground(t);

  const cssVariables = `
    :root {
      --sanity-page-bg: ${pageBg};
      --sanity-bg-main: ${t.bgMain};
      --sanity-bg-top: ${t.bgGradientTop};
      --sanity-bg-mid: ${t.bgGradientMiddle};
      --sanity-bg-bot: ${t.bgGradientBottom};
      --sanity-header-bg: ${t.headerBg};
      --sanity-card-bg: ${t.cardBg};
      --sanity-card-border: ${t.cardBorder};
      --sanity-card-hover-border: ${t.cardHoverBorder};
      --sanity-inner-card-bg: ${t.innerCardBg};
      --sanity-sidebar-start: ${t.sidebarBgStart};
      --sanity-sidebar-mid: ${t.sidebarBgMiddle};
      --sanity-sidebar-end: ${t.sidebarBgEnd};
      --sanity-sidebar-border: ${t.sidebarBorder};
      --sanity-sidebar-active-start: ${t.sidebarActiveItemBgStart};
      --sanity-sidebar-active-end: ${t.sidebarActiveItemBgEnd};
      --sanity-text-primary: ${t.textPrimary};
      --sanity-text-secondary: ${t.textSecondary};
      --sanity-text-muted: ${t.textMuted};
      --sanity-accent-primary: ${t.accentPrimary};
      --sanity-accent-sky: ${t.accentSky};
      --sanity-success: ${t.successColor};
      --sanity-warning: ${t.warningColor};
      --sanity-danger: ${t.dangerColor};
      --sanity-btn-primary-bg: ${t.primaryButtonBg};
      --sanity-btn-primary-hover: ${t.primaryButtonHover};
      --sanity-btn-primary-txt: ${t.primaryButtonTxt};
      --sanity-btn-sec-bg: ${t.secondaryButtonBg};
      --sanity-btn-sec-txt: ${t.secondaryButtonTxt};
      --sanity-pill-bg: ${t.pillBg};
      --sanity-pill-border: ${t.pillBorder};
      --sanity-pill-txt: ${t.pillTxtColor};
      --sanity-priority-high-bg: ${t.priorityHighBg};
      --sanity-priority-high-color: ${t.priorityHighColor};
      --sanity-priority-med-bg: ${t.priorityMediumBg};
      --sanity-priority-med-color: ${t.priorityMediumColor};
      --sanity-priority-low-bg: ${t.priorityLowBg};
      --sanity-priority-low-color: ${t.priorityLowColor};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssVariables }} />;
};
