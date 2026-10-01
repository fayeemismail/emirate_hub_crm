'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { SanityDashboardConfig } from '../types/documents';
import { isValidDashboardConfig } from '../types/typeGuards';
import { SanityFallbackMessage } from './SanityFallbackMessage';

interface SanityPortalBannerProps {
  dashboardConfig: SanityDashboardConfig | null;
  onOpenSimulateModal: () => void;
  showFallbackIfMissing?: boolean;
}

/** Prefer short CRM-friendly labels when CMS still has the old verbose copy. */
function displayTitle(raw?: string) {
  const t = (raw || '').trim();
  if (!t) return 'Website inquiries';
  if (/consultancy website portal/i.test(t)) return 'Website inquiries';
  return t;
}

function displayDescription(raw?: string) {
  const t = (raw || '').trim();
  if (!t) return 'Live form submissions from emiratehub.ae land here.';
  if (/routed directly to this management panel/i.test(t)) {
    return 'Live form submissions from emiratehub.ae land here.';
  }
  return t;
}

function displayButton(raw?: string) {
  const t = (raw || '').trim();
  if (!t || /simulate website form/i.test(t) || /test form submission/i.test(t)) {
    return 'Create lead';
  }
  return t;
}

export const SanityPortalBanner: React.FC<SanityPortalBannerProps> = ({
  dashboardConfig,
  onOpenSimulateModal,
  showFallbackIfMissing = false,
}) => {
  const hasValidData = isValidDashboardConfig(dashboardConfig) && Boolean(dashboardConfig.bannerTitle);

  if (!hasValidData) {
    if (showFallbackIfMissing) {
      return (
        <SanityFallbackMessage 
          entityName="Portal Banner"
          message="No portal banner configuration found in Sanity CMS."
        />
      );
    }
    return null;
  }

  const title = displayTitle(dashboardConfig.bannerTitle);
  const description = displayDescription(dashboardConfig.bannerDescription);
  const buttonLabel = displayButton(dashboardConfig.bannerButtonText);

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
      style={{
        backgroundColor: 'var(--sanity-card-bg, #FFFFFF)',
        borderColor: 'var(--sanity-card-border, #E7E5E4)',
      }}
    >
      <div className="min-w-0">
        <h2
          className="text-base font-semibold tracking-tight"
          style={{ color: 'var(--sanity-text-primary, #1C1917)' }}
        >
          {title}
        </h2>
        <p
          className="mt-0.5 text-sm leading-snug line-clamp-2"
          style={{ color: 'var(--sanity-text-secondary, #78716C)' }}
        >
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenSimulateModal}
        className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer sm:self-auto"
        style={{
          color: 'var(--sanity-accent-primary, #E02126)',
          borderColor: 'var(--sanity-accent-primary, #E02126)',
          backgroundColor: '#FEE2E2',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#E02126';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FEE2E2';
          e.currentTarget.style.color = '#E02126';
        }}
      >
          <span>{buttonLabel}</span>
          <Plus className="h-3.5 w-3.5" />
        </button>
    </div>
  );
};
