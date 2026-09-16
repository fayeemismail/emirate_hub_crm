'use client';

import React from 'react';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import { SanityDashboardConfig } from '../types/documents';
import { isValidDashboardConfig } from '../types/typeGuards';
import { SanityFallbackMessage } from './SanityFallbackMessage';

interface SanityPortalBannerProps {
  dashboardConfig: SanityDashboardConfig | null;
  onOpenSimulateModal: () => void;
  showFallbackIfMissing?: boolean;
}

export const SanityPortalBanner: React.FC<SanityPortalBannerProps> = ({
  dashboardConfig,
  onOpenSimulateModal,
  showFallbackIfMissing = false,
}) => {
  // Check if incoming Sanity data is present and valid
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
    // Do not show the component if there is no data
    return null;
  }
  console.log(hasValidData ?   hasValidData : "false")

  const bgStart = dashboardConfig.bannerBgStart || '#0d2e59';
  const bgEnd = dashboardConfig.bannerBgEnd || '#092244';
  const borderColor = dashboardConfig.bannerBorderColor || '#93c5fd4d';

  return (
    <div 
      className="rounded-2xl p-5 border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md"
      style={{
        background: `linear-gradient(90deg, ${bgStart} 0%, ${bgEnd} 100%)`,
        borderColor,
        boxShadow: '0 10px 30px #040f1eb3',
      }}
    >
      <div className="flex items-center gap-3.5">
        <div 
          className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 border"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
            borderColor: '#93c5fd4d',
            boxShadow: '0 4px 14px #1e3a8a80',
          }}
        >
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: '#ffffff' }}>
            {dashboardConfig.bannerTitle}
          </h2>
          {dashboardConfig.bannerDescription && (
            <p className="text-xs mt-0.5 font-normal" style={{ color: '#e0f2fee6' }}>
              {dashboardConfig.bannerDescription}
            </p>
          )}
        </div>
      </div>

      {dashboardConfig.bannerButtonText && (
        <button
          onClick={onOpenSimulateModal}
          className="px-4 py-2 rounded-xl text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 transition-all shadow-md cursor-pointer border hover:opacity-95 active:scale-[0.99]"
          style={{
            backgroundColor: '#2563eb',
            borderColor: '#93c5fd66',
            boxShadow: '0 4px 12px #02061780',
          }}
        >
          <span>{dashboardConfig.bannerButtonText}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
