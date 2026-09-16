'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SanityDashboardConfig,
  SanitySiteSettings,
  SanityFooter,
  SanityThemeSettings,
  SanityService,
} from '../types/documents';
import {
  isValidDashboardConfig,
  isValidSiteSettings,
  isValidFooter,
  isValidThemeSettings,
  hasValidSanityServices,
} from '../types/typeGuards';
import { fetchUnifiedSanityDashboardData, UnifiedSanityData } from '../fetchers/dashboardFetchers';

const STORAGE_CACHE_KEY = 'emirate_sanity_dashboard_cache_v1';

export interface SanityDataState {
  dashboardConfig: SanityDashboardConfig | null;
  siteSettings: SanitySiteSettings | null;
  footer: SanityFooter | null;
  themeSettings: SanityThemeSettings | null;
  services: SanityService[] | null;
  hasDashboardConfig: boolean;
  hasSiteSettings: boolean;
  hasFooter: boolean;
  hasThemeSettings: boolean;
  hasServices: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Memory cache for active session
let inMemoryData: UnifiedSanityData | null = null;

export function useSanityData(): SanityDataState {
  // Initialize state with in-memory or sessionStorage cache for zero-latency initial render
  const [data, setData] = useState<UnifiedSanityData>(() => {
    if (inMemoryData) {
      return inMemoryData;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(STORAGE_CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          inMemoryData = parsed;
          return parsed;
        }
      } catch {
        // Ignore storage read errors
      }
    }
    return {
      dashboardConfig: null,
      siteSettings: null,
      footer: null,
      themeSettings: null,
      services: null,
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => !inMemoryData);
  const [error, setError] = useState<string | null>(null);

  const loadSanityData = useCallback(async () => {
    try {
      // Fetch all documents in a single ultra-fast edge CDN query
      const result = await fetchUnifiedSanityDashboardData();

      if (result) {
        const validated: UnifiedSanityData = {
          dashboardConfig: isValidDashboardConfig(result.dashboardConfig) ? result.dashboardConfig : null,
          siteSettings: isValidSiteSettings(result.siteSettings) ? result.siteSettings : null,
          footer: isValidFooter(result.footer) ? result.footer : null,
          themeSettings: isValidThemeSettings(result.themeSettings) ? result.themeSettings : null,
          services: hasValidSanityServices(result.services) ? result.services : null,
        };

        inMemoryData = validated;
        setData(validated);

        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(validated));
          } catch {
            // Ignore storage write errors
          }
        }
      }
    } catch (err: any) {
      console.warn('[Sanity useSanityData]:', err);
      setError(err?.message || 'Failed to fetch Sanity data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSanityData();
  }, [loadSanityData]);

  const dashboardConfig = data.dashboardConfig;
  const siteSettings = data.siteSettings;
  const footer = data.footer;
  const themeSettings = data.themeSettings;
  const services = data.services;

  return {
    dashboardConfig,
    siteSettings,
    footer,
    themeSettings,
    services,
    hasDashboardConfig: Boolean(dashboardConfig),
    hasSiteSettings: Boolean(siteSettings),
    hasFooter: Boolean(footer),
    hasThemeSettings: Boolean(themeSettings),
    hasServices: Boolean(services && services.length > 0),
    isLoading,
    error,
    refresh: loadSanityData,
  };
}
