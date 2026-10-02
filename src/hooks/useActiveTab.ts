'use client';

import { useState, useEffect, useCallback } from 'react';

export type DashboardTab = 'dashboard' | 'requests' | 'reassignment' | 'settings';

const VALID_TABS: DashboardTab[] = ['dashboard', 'requests', 'reassignment', 'settings'];

export function useActiveTab(defaultTab: DashboardTab = 'dashboard') {
  const [activeTab, setActiveTab] = useState<DashboardTab>(defaultTab);

  // Synchronize active tab with URL query parameter (?tab=...) and localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as DashboardTab | null;
    const storedTab = (
      localStorage.getItem('emirate_active_tab') || 
      localStorage.getItem('foundex_active_tab')
    ) as DashboardTab | null;

    let targetTab: DashboardTab = defaultTab;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      targetTab = tabParam;
    } else if (storedTab && VALID_TABS.includes(storedTab)) {
      targetTab = storedTab;
    }

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
      const tabParam = params.get('tab') as DashboardTab | null;
      if (tabParam && VALID_TABS.includes(tabParam)) {
        setActiveTab(tabParam);
        localStorage.setItem('emirate_active_tab', tabParam);
      } else {
        setActiveTab('dashboard');
        localStorage.setItem('emirate_active_tab', 'dashboard');
      }
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
