'use client';

import { useState, useEffect, useCallback } from 'react';

export type DashboardTab = 'dashboard' | 'requests' | 'off-pipeline' | 'settings';

const VALID_TABS: DashboardTab[] = ['dashboard', 'requests', 'off-pipeline', 'settings'];

/** Older bookmark / localStorage id → current tab. */
const LEGACY_TAB_MAP: Record<string, DashboardTab> = {
  reassignment: 'off-pipeline',
};

function resolveTab(raw: string | null | undefined, fallback: DashboardTab): DashboardTab {
  if (!raw) return fallback;
  if (VALID_TABS.includes(raw as DashboardTab)) return raw as DashboardTab;
  if (LEGACY_TAB_MAP[raw]) return LEGACY_TAB_MAP[raw];
  return fallback;
}

export function useActiveTab(defaultTab: DashboardTab = 'dashboard') {
  const [activeTab, setActiveTab] = useState<DashboardTab>(defaultTab);

  // Synchronize active tab with URL query parameter (?tab=...) and localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const storedTab =
      localStorage.getItem('emirate_active_tab') || localStorage.getItem('foundex_active_tab');

    const targetTab = resolveTab(tabParam ?? storedTab, defaultTab);
    setActiveTab(targetTab);

    try {
      localStorage.setItem('emirate_active_tab', targetTab);
      const url = new URL(window.location.href);
      if (targetTab !== 'dashboard') {
        url.searchParams.set('tab', targetTab);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore storage errors
    }
  }, [defaultTab]);

  // Listen to browser navigation (back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const targetTab = resolveTab(params.get('tab'), 'dashboard');
      setActiveTab(targetTab);
      localStorage.setItem('emirate_active_tab', targetTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Change tab with URL and localStorage sync
  const setTab = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('emirate_active_tab', tab);
        const url = new URL(window.location.href);
        if (tab !== 'dashboard') {
          url.searchParams.set('tab', tab);
        } else {
          url.searchParams.delete('tab');
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  return { activeTab, setActiveTab: setTab };
}
