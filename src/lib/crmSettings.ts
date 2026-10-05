'use client';

const LOOKBACK_KEY = 'emirate_inquiry_lookback_days';
const TABLE_SORT_KEY = 'emirate_inquiry_table_sort';
const SETTINGS_EVENT = 'emirate-crm-settings';

export const LOOKBACK_PRESETS = [7, 30, 60, 90] as const;

/** 0 = all time. Default 30. */
export const DEFAULT_LOOKBACK_DAYS = 30;

export type TableSortMode = 'priority' | 'status' | 'newest' | 'oldest';

export const DEFAULT_TABLE_SORT: TableSortMode = 'priority';

function emitSettingsChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function getInquiryLookbackDays(): number {
  if (typeof window === 'undefined') return DEFAULT_LOOKBACK_DAYS;
  try {
    const raw = localStorage.getItem(LOOKBACK_KEY);
    if (raw === null || raw === '') return DEFAULT_LOOKBACK_DAYS;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) return DEFAULT_LOOKBACK_DAYS;
    return Math.min(n, 3650);
  } catch {
    return DEFAULT_LOOKBACK_DAYS;
  }
}

export function setInquiryLookbackDays(days: number): void {
  if (typeof window === 'undefined') return;
  const clamped = Math.max(0, Math.min(Math.floor(days), 3650));
  try {
    localStorage.setItem(LOOKBACK_KEY, String(clamped));
    emitSettingsChange();
  } catch {
    // ignore
  }
}

export function getTableSortMode(): TableSortMode {
  if (typeof window === 'undefined') return DEFAULT_TABLE_SORT;
  try {
    const raw = localStorage.getItem(TABLE_SORT_KEY);
    if (raw === 'priority' || raw === 'status' || raw === 'newest' || raw === 'oldest') {
      return raw;
    }
  } catch {
    // ignore
  }
  return DEFAULT_TABLE_SORT;
}

export function setTableSortMode(mode: TableSortMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TABLE_SORT_KEY, mode);
    emitSettingsChange();
  } catch {
    // ignore
  }
}

export function subscribeCrmSettings(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onChange();
  window.addEventListener(SETTINGS_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(SETTINGS_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/** Map table sort UI mode → admin leads API sort params. */
export function tableSortToApi(mode: TableSortMode): {
  sortBy: 'createdAt' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
} {
  switch (mode) {
    case 'oldest':
      return { sortBy: 'createdAt', sortOrder: 'asc' };
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    case 'status':
      return { sortBy: 'status', sortOrder: 'asc' };
    case 'priority':
    default:
      return { sortBy: 'priority', sortOrder: 'asc' };
  }
}
