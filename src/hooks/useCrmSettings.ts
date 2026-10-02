'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_LOOKBACK_DAYS,
  DEFAULT_TABLE_SORT,
  getInquiryLookbackDays,
  getTableSortMode,
  setInquiryLookbackDays,
  setTableSortMode,
  subscribeCrmSettings,
  type TableSortMode,
} from '../lib/crmSettings';

export function useCrmSettings() {
  const [lookbackDays, setLookbackDaysState] = useState(DEFAULT_LOOKBACK_DAYS);
  const [tableSort, setTableSortState] = useState<TableSortMode>(DEFAULT_TABLE_SORT);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setLookbackDaysState(getInquiryLookbackDays());
    setTableSortState(getTableSortMode());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    return subscribeCrmSettings(refresh);
  }, [refresh]);

  const setLookbackDays = useCallback((days: number) => {
    setInquiryLookbackDays(days);
    setLookbackDaysState(getInquiryLookbackDays());
  }, []);

  const setTableSort = useCallback((mode: TableSortMode) => {
    setTableSortMode(mode);
    setTableSortState(getTableSortMode());
  }, []);

  return {
    lookbackDays,
    setLookbackDays,
    tableSort,
    setTableSort,
    hydrated,
  };
}
