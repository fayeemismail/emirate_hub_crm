'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ServiceRequest, RequestPriority, PipelineStatus, CatalogService } from '../../types';
import { LOOKBACK_PRESETS, lookbackLabel, tableSortToApi, type TableSortMode } from '../../lib/crmSettings';
import { useCrmSettings } from '../../hooks/useCrmSettings';
import { leadsApi, type LeadItem } from '../../lib/api';
import { leadToServiceRequest } from '../../lib/adapters';
import { KanbanBoard } from './KanbanBoard';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CustomSelect } from '../ui/CustomSelect';
import { RequestStatusBadge } from '../ui/RequestStatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { InquiriesPageSkeleton, Spinner } from '../ui/loading';
import { Enter } from '../ui/motion';
import {
  ARCHIVE_CONFIRM_BUTTON,
  ARCHIVE_CONFIRM_TITLE,
  ACTIVE_INQUIRIES_EMPTY,
  archiveConfirmMessage,
} from '../../lib/archiveCopy';
import { daysInStage, formatStageAge, isStaleInStage } from '../../lib/stageAge';
import {
  Search,
  Kanban,
  Table as TableIcon,
  Archive,
  RotateCcw,
  SlidersHorizontal,
  X,
  Check,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

function getPaginationRange(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

type InquiriesViewMode = 'kanban' | 'table';

const VIEW_STORAGE_KEY = 'emirate_inquiries_view';

function readStoredViewMode(): InquiriesViewMode {
  if (typeof window === 'undefined') return 'table';
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('view');
    if (fromUrl === 'table' || fromUrl === 'kanban') return fromUrl;
    const fromStorage = localStorage.getItem(VIEW_STORAGE_KEY);
    if (fromStorage === 'table' || fromStorage === 'kanban') return fromStorage;
    // On mobile (< 640px), default to table view
    if (window.innerWidth < 640) return 'table';
  } catch {
    // ignore
  }
  return 'kanban';
}

function persistViewMode(mode: InquiriesViewMode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
    const url = new URL(window.location.href);
    if (mode === 'table') {
      url.searchParams.set('view', 'table');
    } else {
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // ignore
  }
}

export interface InquiryFiltersState {
  search: string;
  service: string;
  status: string;
  tableSort: TableSortMode;
  viewMode: InquiriesViewMode;
}

interface ServiceRequestsViewProps {
  requests: ServiceRequest[];
  leadsTotal: number;
  pipelineStatuses: PipelineStatus[];
  catalogServices: CatalogService[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  filters: InquiryFiltersState;
  onFiltersChange: (patch: Partial<InquiryFiltersState>) => void;
  onSelectRequest: (req: ServiceRequest) => void;
  onUpdateStatus: (id: string, newStatus: string, boardOrder?: number) => void | Promise<boolean | void>;
  onKanbanSync: (
    next: ServiceRequest[],
    previous: ServiceRequest[]
  ) => Promise<boolean>;
  onDeleteRequest?: (id: string) => void;
}

const PRIORITY_DOT: Record<RequestPriority, string> = {
  High: '#E02126',
  Medium: '#D97706',
  Low: '#A8A29E',
};

const TABLE_SORT_OPTIONS: { value: TableSortMode; label: string }[] = [
  { value: 'newest', label: 'Sort: Newest' },
  { value: 'oldest', label: 'Sort: Oldest' },
  { value: 'priority', label: 'Sort: Priority' },
  { value: 'status', label: 'Sort: Status' },
];

export const ServiceRequestsView: React.FC<ServiceRequestsViewProps> = ({
  requests,
  leadsTotal,
  pipelineStatuses,
  catalogServices,
  isLoading = false,
  isRefreshing = false,
  filters,
  onFiltersChange,
  onSelectRequest,
  onUpdateStatus: _onUpdateStatus,
  onKanbanSync,
  onDeleteRequest,
}) => {
  void _onUpdateStatus;
  const { lookbackDays, setLookbackDays, setTableSort } = useCrmSettings();
  const [searchInput, setSearchInput] = useState(filters.search);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [pendingLookback, setPendingLookback] = useState(lookbackDays);
  const [pendingService, setPendingService] = useState(filters.service);
  const [pendingStatus, setPendingStatus] = useState(filters.status);
  const [pendingSort, setPendingSort] = useState<TableSortMode>(filters.tableSort);

  // Table view backend-driven pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tableData, setTableData] = useState<ServiceRequest[]>([]);
  const [tableTotalItems, setTableTotalItems] = useState(0);
  const [tableTotalPages, setTableTotalPages] = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isTableFetching, setIsTableFetching] = useState(false);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const tableFetchGen = useRef(0);
  const hasLoadedTableOnce = useRef(false);
  const prevRequestsRef = useRef(requests);

  // Sync external request changes (status/notes updates from modal or refetches) into table view
  useEffect(() => {
    if (prevRequestsRef.current !== requests) {
      prevRequestsRef.current = requests;
      if (filters.viewMode === 'table') {
        setTableRefreshKey((k) => k + 1);
      }
    }
  }, [requests, filters.viewMode]);

  // Reset page to 1 whenever any filter or pagination limit changes
  const filterFingerprint = `${filters.search.trim()}|${filters.service}|${filters.status}|${filters.tableSort}|${lookbackDays}|${limit}`;
  const prevFilterFingerprintRef = useRef(filterFingerprint);
  useEffect(() => {
    if (prevFilterFingerprintRef.current !== filterFingerprint) {
      prevFilterFingerprintRef.current = filterFingerprint;
      setPage(1);
    }
  }, [filterFingerprint]);

  // Backend-driven fetching for table view
  useEffect(() => {
    if (filters.viewMode !== 'table') return;

    let cancelled = false;
    const gen = ++tableFetchGen.current;

    if (!hasLoadedTableOnce.current) {
      setIsTableLoading(true);
    }
    setIsTableFetching(true);

    const { sortBy, sortOrder } = tableSortToApi(filters.tableSort);

    leadsApi
      .getAdminLeads({
        view: 'list',
        page,
        limit,
        search: filters.search.trim() || undefined,
        service: filters.service !== 'All' ? filters.service : undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        lookbackDays: lookbackDays > 0 ? lookbackDays : undefined,
        sortBy,
        sortOrder,
      })
      .then((res) => {
        if (cancelled || gen !== tableFetchGen.current) return;
        const rawList = Array.isArray(res.data) ? (res.data as LeadItem[]) : [];
        const mapped = rawList
          .map(leadToServiceRequest)
          .filter((req) => !req.isDeleted);
        setTableData(mapped);
        const total = res.pagination?.totalItems ?? mapped.length;
        const totalP = res.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));
        setTableTotalItems(total);
        setTableTotalPages(totalP);
        hasLoadedTableOnce.current = true;
        if (page > totalP && totalP > 0) {
          setPage(totalP);
        }
      })
      .catch((err) => {
        if (cancelled || gen !== tableFetchGen.current) return;
        console.error('Failed to load paginated leads for table:', err);
      })
      .finally(() => {
        if (!cancelled && gen === tableFetchGen.current) {
          setIsTableLoading(false);
          setIsTableFetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    filters.viewMode,
    page,
    limit,
    filters.search,
    filters.service,
    filters.status,
    filters.tableSort,
    lookbackDays,
    tableRefreshKey,
  ]);

  const handleArchiveRow = async (reqId: string) => {
    if (onDeleteRequest) {
      await onDeleteRequest(reqId);
    }
    if (tableData.length <= 1 && page > 1) {
      setPage((p) => Math.max(1, p - 1));
    } else {
      setTableRefreshKey((k) => k + 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > tableTotalPages || newPage === page) return;
    setPage(newPage);
  };

  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    persistViewMode(filters.viewMode);
  }, [filters.viewMode]);

  useEffect(() => {
    if (!isMobileFilterOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileFilterOpen]);

  // On mobile (< 640px), ensure table view is default if no explicit preference is stored
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      try {
        const fromUrl = new URLSearchParams(window.location.search).get('view');
        const fromStorage = localStorage.getItem(VIEW_STORAGE_KEY);
        if (!fromUrl && !fromStorage && filters.viewMode !== 'table') {
          onFiltersChange({ viewMode: 'table' });
        }
      } catch {
        // ignore
      }
    }
  }, [filters.viewMode, onFiltersChange]);

  // Keep local search box in sync when Reset clears filters.
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ search: searchInput });
      }
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput, filters.search, onFiltersChange]);

  const serviceOptions = [
    { value: 'All', label: 'All services' },
    ...(catalogServices.length > 0
      ? catalogServices.map((s) => ({ value: s.slug, label: s.title }))
      : Array.from(new Set(requests.map((r) => r.serviceSlug || r.service)))
          .filter(Boolean)
          .map((v) => ({ value: v, label: v }))),
  ];

  const statusOptions = useMemo(
    () => [
      { value: 'All', label: 'All statuses' },
      ...[...pipelineStatuses]
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ value: s.slug, label: s.title })),
    ],
    [pipelineStatuses]
  );

  const lookbackOptions = useMemo(
    () => [
      ...LOOKBACK_PRESETS.map((d) => ({
        value: String(d),
        label: lookbackLabel(d),
      })),
      ...(LOOKBACK_PRESETS.includes(lookbackDays as (typeof LOOKBACK_PRESETS)[number]) ||
      lookbackDays === 0
        ? []
        : [{ value: String(lookbackDays), label: lookbackLabel(lookbackDays) }]),
      { value: '0', label: 'All time' },
    ],
    [lookbackDays]
  );

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.service !== 'All' ||
    (filters.viewMode === 'table' && filters.status !== 'All');

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (lookbackDays !== 30) count++;
    if (filters.service !== 'All') count++;
    if (filters.viewMode === 'table') {
      if (filters.status !== 'All') count++;
      if (filters.tableSort !== 'newest') count++;
    }
    return count;
  }, [lookbackDays, filters.service, filters.status, filters.tableSort, filters.viewMode]);

  const handleOpenMobileFilters = () => {
    setPendingLookback(lookbackDays);
    setPendingService(filters.service);
    setPendingStatus(filters.status);
    setPendingSort(filters.tableSort);
    setIsMobileFilterOpen(true);
  };

  const handleResetMobilePending = () => {
    setPendingLookback(30);
    setPendingService('All');
    setPendingStatus('All');
    setPendingSort('newest');
  };

  const handleApplyMobileFilters = () => {
    if (pendingLookback !== lookbackDays) {
      setLookbackDays(pendingLookback);
    }
    if (pendingSort !== filters.tableSort) {
      setTableSort(pendingSort);
    }
    onFiltersChange({
      service: pendingService,
      status: pendingStatus,
      tableSort: pendingSort,
    });
    setIsMobileFilterOpen(false);
  };

  const pendingActiveCount = useMemo(() => {
    let count = 0;
    if (pendingLookback !== 30) count++;
    if (pendingService !== 'All') count++;
    if (filters.viewMode === 'table') {
      if (pendingStatus !== 'All') count++;
      if (pendingSort !== 'newest') count++;
    }
    return count;
  }, [pendingLookback, pendingService, pendingStatus, pendingSort, filters.viewMode]);

  const resetFilters = () => {
    setSearchInput('');
    onFiltersChange({ search: '', service: 'All', status: 'All' });
  };

  const resetAllMobileFilters = () => {
    setSearchInput('');
    onFiltersChange({ search: '', service: 'All', status: 'All', tableSort: 'newest' });
    setTableSort('newest');
    setLookbackDays(30);
  };

  const rangeLabel = lookbackLabel(lookbackDays);
  const isTableMode = filters.viewMode === 'table';
  const startItem = tableTotalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, tableTotalItems);

  if (isLoading || (isTableMode && isTableLoading)) {
    return <InquiriesPageSkeleton viewMode={filters.viewMode} />;
  }

  return (
    <div className="relative space-y-4 sm:space-y-5 pb-16 sm:pb-0">
      {/* Mobile single-line compact header */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <h2
          className="text-base font-semibold tracking-tight truncate"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Service inquiries
        </h2>
        <div
          className="flex items-center gap-1.5 text-xs shrink-0 tabular-nums"
          style={{ color: '#78716C' }}
        >
          <span>
            {isTableMode
              ? tableTotalItems === 0
                ? `0 inquiries · ${rangeLabel}`
                : `${startItem}–${endItem} of ${tableTotalItems} · ${rangeLabel}`
              : `${requests.length} shown · ${rangeLabel}`}
          </span>
          {isRefreshing || isTableFetching ? (
            <span
              className="crm-fade-enter inline-flex items-center"
              role="status"
              aria-live="polite"
              title="Updating…"
            >
              <Spinner size="xs" color="#A8A29E" />
            </span>
          ) : null}
        </div>
      </div>

      {/* Desktop 2-line header */}
      <div className="hidden sm:block">
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Service inquiries
        </h2>
        <p
          className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
          style={{ color: '#78716C' }}
        >
          <span>
            {isTableMode
              ? tableTotalItems === 0
                ? `0 inquiries`
                : `Showing ${startItem}–${endItem} of ${tableTotalItems} inquiries`
              : `${requests.length} shown`}
            {' · '}
            {rangeLabel}
          </span>
          {isRefreshing || isTableFetching ? (
            <span
              className="crm-fade-enter inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: '#A8A29E' }}
              role="status"
              aria-live="polite"
            >
              <Spinner size="xs" color="#A8A29E" />
              Updating…
            </span>
          ) : null}
        </p>
      </div>

      {/* Mobile Toolbar (sm:hidden) */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: '#A8A29E' }}
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search inquiries, client, email…"
            className="w-full rounded-xl border py-2.5 pl-9 pr-9 text-sm focus:outline-none transition-shadow"
            style={{
              borderColor: '#E7E5E4',
              backgroundColor: '#FFFFFF',
              color: '#1C1917',
            }}
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Controls Row: Filters button + Board/Table switcher */}
        <div className="flex items-center justify-between gap-2">
          {/* Filters Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenMobileFilters}
              className="crm-interactive inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xs"
              style={{
                borderColor: activeFilterCount > 0 ? '#FCA5A5' : '#E7E5E4',
                backgroundColor: activeFilterCount > 0 ? '#FEF2F2' : '#FFFFFF',
                color: activeFilterCount > 0 ? '#B91C1C' : '#44403C',
              }}
              aria-label="Open inquiry filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 ? (
                <span
                  className="inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 text-[10px] font-bold rounded-full text-white leading-none"
                  style={{ backgroundColor: '#E02126' }}
                >
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            {(hasActiveFilters || activeFilterCount > 0) && (
              <button
                type="button"
                onClick={resetAllMobileFilters}
                className="crm-interactive inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl border shrink-0 text-stone-500 hover:text-stone-800"
                style={{
                  borderColor: '#E7E5E4',
                  backgroundColor: '#FFFFFF',
                }}
                aria-label="Reset all filters"
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Board vs Table Switcher */}
          <div
            className="inline-flex rounded-xl border p-0.5 shrink-0"
            style={{ borderColor: '#E7E5E4', backgroundColor: '#F5F5F4' }}
            role="tablist"
            aria-label="Inquiries view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filters.viewMode === 'kanban'}
              onClick={() => onFiltersChange({ viewMode: 'kanban' })}
              className="crm-interactive inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-all"
              style={{
                backgroundColor: filters.viewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                color: filters.viewMode === 'kanban' ? '#E02126' : '#78716C',
                boxShadow: filters.viewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filters.viewMode === 'table'}
              onClick={() => onFiltersChange({ viewMode: 'table' })}
              className="crm-interactive inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-all"
              style={{
                backgroundColor: filters.viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: filters.viewMode === 'table' ? '#E02126' : '#78716C',
                boxShadow: filters.viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Toolbar (sm:flex) */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: '#A8A29E' }}
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-lg border py-1.5 pl-8 pr-3 text-sm focus:outline-none"
            style={{
              borderColor: '#E7E5E4',
              backgroundColor: '#FFFFFF',
              color: '#1C1917',
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CustomSelect
            value={String(lookbackDays)}
            options={lookbackOptions}
            onChange={(v) => setLookbackDays(Number.parseInt(v, 10) || 0)}
            ariaLabel="Inquiry lookback window"
            minWidth={140}
            align="right"
          />

          {serviceOptions.length > 1 && (
            <CustomSelect
              value={filters.service}
              options={serviceOptions}
              onChange={(v) => onFiltersChange({ service: v })}
              ariaLabel="Filter by service"
              minWidth={150}
              align="right"
            />
          )}

          {filters.viewMode === 'table' && (
            <>
              <CustomSelect
                value={filters.status}
                options={statusOptions}
                onChange={(v) => onFiltersChange({ status: v })}
                ariaLabel="Filter by status"
                minWidth={150}
                align="right"
              />
              <CustomSelect
                value={filters.tableSort}
                options={TABLE_SORT_OPTIONS}
                onChange={(v) => {
                  const mode = v as TableSortMode;
                  setTableSort(mode);
                  onFiltersChange({ tableSort: mode });
                }}
                ariaLabel="Sort table"
                minWidth={150}
                align="right"
              />
            </>
          )}

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="crm-interactive inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium shrink-0"
            style={{
              borderColor: '#E7E5E4',
              color: hasActiveFilters ? '#78716C' : '#D6D3D1',
              backgroundColor: '#FFFFFF',
              cursor: hasActiveFilters ? 'pointer' : 'default',
              opacity: hasActiveFilters ? 1 : 0.55,
            }}
            onMouseEnter={(e) => {
              if (!hasActiveFilters) return;
              e.currentTarget.style.backgroundColor = '#F5F5F4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
            aria-label="Reset filters"
            title={hasActiveFilters ? 'Reset filters' : 'No filters to reset'}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <div
            className="inline-flex rounded-lg border p-0.5"
            style={{ borderColor: '#E7E5E4' }}
            role="tablist"
            aria-label="Inquiries view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filters.viewMode === 'kanban'}
              onClick={() => onFiltersChange({ viewMode: 'kanban' })}
              className="crm-interactive inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: filters.viewMode === 'kanban' ? '#FEE2E2' : 'transparent',
                color: filters.viewMode === 'kanban' ? '#E02126' : '#78716C',
              }}
            >
              <Kanban className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filters.viewMode === 'table'}
              onClick={() => onFiltersChange({ viewMode: 'table' })}
              className="crm-interactive inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: filters.viewMode === 'table' ? '#FEE2E2' : 'transparent',
                color: filters.viewMode === 'table' ? '#E02126' : '#78716C',
              }}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      <Enter key={filters.viewMode} className="min-w-0">
      {pipelineStatuses.length === 0 ? (
        <EmptyState
          icon="pipeline"
          title="Pipeline not configured"
          description="No lead statuses are available from the CMS yet. Add and publish leadStatus documents in Sanity, then refresh."
        />
      ) : (isTableMode ? tableTotalItems === 0 : requests.length === 0) ? (
        <EmptyState
          icon={hasActiveFilters || lookbackDays > 0 ? 'search' : 'inbox'}
          title={hasActiveFilters || lookbackDays > 0 ? 'No matching inquiries' : 'No inquiries yet'}
          description={
            !hasActiveFilters && lookbackDays === 0
              ? ACTIVE_INQUIRIES_EMPTY
              : lookbackDays > 0 && !hasActiveFilters
                ? `Nothing in the last ${lookbackDays} days — try widening the lookback in Settings or filters.`
                : 'Try a different search or clear your filters.'
          }
          action={
            hasActiveFilters || lookbackDays > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onFiltersChange({ search: '', service: 'All', status: 'All' });
                  if (lookbackDays > 0) setLookbackDays(0);
                }}
                className="text-sm font-medium cursor-pointer"
                style={{ color: '#E02126' }}
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : filters.viewMode === 'kanban' ? (
        <KanbanBoard
          requests={requests}
          columns={pipelineStatuses.map((s) => ({ id: s.slug, title: s.title }))}
          onSelectRequest={onSelectRequest}
          onKanbanSync={onKanbanSync}
          onDeleteRequest={onDeleteRequest}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div
            className="hidden sm:block rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E7E5E4',
            }}
          >
            <div
              className="overflow-x-auto transition-opacity duration-150"
              style={{ opacity: isTableFetching ? 0.6 : 1 }}
            >
              <table className="w-full text-left min-w-[720px]">
                <thead>
                  <tr
                    className="border-b text-xs"
                    style={{ borderColor: '#E7E5E4', color: '#A8A29E' }}
                  >
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Phone</th>
                    <th className="py-3 px-4 font-medium">Service</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">In stage</th>
                    <th className="py-3 px-4 font-medium">Priority</th>
                    {onDeleteRequest ? (
                      <th className="py-3 px-4 font-medium text-right w-10"> </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((req) => {
                    const clientName =
                      req.name ||
                      `${req.firstName} ${req.lastName}`.trim() ||
                      'Client';
                    const ageDays = daysInStage(req.statusChangedAt, req.createdAt);
                    const stale = isStaleInStage(ageDays);

                    return (
                      <tr
                        key={req.id}
                        onClick={() => onSelectRequest(req)}
                        className="border-b last:border-b-0 cursor-pointer crm-interactive"
                        style={{
                          borderColor: '#E7E5E4',
                          backgroundColor: stale ? '#FFFBEB' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = stale ? '#FEF3C7' : '#FAF9F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = stale ? '#FFFBEB' : 'transparent';
                        }}
                      >
                        <td className="py-3.5 px-4 text-sm font-medium" style={{ color: '#1C1917' }}>
                          {clientName}
                        </td>
                        <td className="py-3.5 px-4 text-sm truncate max-w-[180px]" style={{ color: '#78716C' }}>
                          {req.email}
                        </td>
                        <td className="py-3.5 px-4 text-sm tabular-nums" style={{ color: '#78716C' }}>
                          {req.phone || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-sm" style={{ color: '#1C1917' }}>
                          {req.service}
                        </td>
                        <td className="py-3.5 px-4">
                          <RequestStatusBadge status={req.status} pipelineStatuses={pipelineStatuses} />
                        </td>
                        <td
                          className="py-3.5 px-4 text-xs font-medium tabular-nums"
                          style={{ color: stale ? '#B45309' : '#78716C' }}
                          title="Time in current stage"
                        >
                          {formatStageAge(ageDays)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: PRIORITY_DOT[req.priority] }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: '#78716C' }}
                            >
                              {req.priority}
                            </span>
                          </div>
                        </td>
                        {onDeleteRequest ? (
                          <td
                            className="py-3.5 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmAction({
                                  isOpen: true,
                                  title: ARCHIVE_CONFIRM_TITLE,
                                  message: archiveConfirmMessage(clientName),
                                  confirmText: ARCHIVE_CONFIRM_BUTTON,
                                  variant: 'danger',
                                  onConfirm: () => handleArchiveRow(req.id),
                                });
                              }}
                              className="p-1.5 rounded-lg cursor-pointer"
                              style={{ color: '#B91C1C' }}
                              aria-label="Archive inquiry"
                              title="Archive"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Desktop Table Pagination Footer */}
            <div
              className="border-t px-4 py-3 sm:px-5 flex items-center justify-between text-xs"
              style={{ borderColor: '#E7E5E4', backgroundColor: '#FFFFFF' }}
            >
              {/* Left: Showing X to Y of Z */}
              <div className="flex items-center gap-2.5">
                <span style={{ color: '#78716C' }}>
                  Showing <span className="font-semibold" style={{ color: '#1C1917' }}>{startItem}</span> to{' '}
                  <span className="font-semibold" style={{ color: '#1C1917' }}>{endItem}</span> of{' '}
                  <span className="font-semibold" style={{ color: '#1C1917' }}>{tableTotalItems}</span> inquiries
                </span>
                {isTableFetching && (
                  <span className="inline-flex items-center gap-1">
                    <Spinner size="xs" color="#E02126" />
                  </span>
                )}
              </div>

              {/* Right: Rows per page & Page controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2" style={{ color: '#78716C' }}>
                  <span>Rows per page:</span>
                  <select
                    id="table-page-size-select"
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border px-2 py-1 text-xs font-medium cursor-pointer outline-none transition-colors"
                    style={{
                      borderColor: '#E7E5E4',
                      backgroundColor: '#FFFFFF',
                      color: '#1C1917',
                    }}
                    aria-label="Rows per page"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  {/* First page button */}
                  <button
                    type="button"
                    disabled={page <= 1 || isTableFetching}
                    onClick={() => goToPage(1)}
                    className="p-1.5 rounded-lg border transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer hover:bg-stone-50"
                    style={{ borderColor: '#E7E5E4', color: '#78716C' }}
                    title="First page"
                    aria-label="First page"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Previous page button */}
                  <button
                    type="button"
                    disabled={page <= 1 || isTableFetching}
                    onClick={() => goToPage(page - 1)}
                    className="p-1.5 rounded-lg border transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer hover:bg-stone-50"
                    style={{ borderColor: '#E7E5E4', color: '#78716C' }}
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Numbered page buttons with Ellipsis */}
                  <div className="flex items-center gap-1 mx-1">
                    {getPaginationRange(page, tableTotalPages).map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-1 text-xs select-none"
                            style={{ color: '#A8A29E' }}
                          >
                            …
                          </span>
                        );
                      }
                      const isCurrent = p === page;
                      return (
                        <button
                          key={p}
                          type="button"
                          disabled={isCurrent || isTableFetching}
                          onClick={() => goToPage(p as number)}
                          className="min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:cursor-default"
                          style={{
                            backgroundColor: isCurrent ? '#E02126' : 'transparent',
                            color: isCurrent ? '#FFFFFF' : '#1C1917',
                            border: isCurrent ? '1px solid #E02126' : '1px solid #E7E5E4',
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next page button */}
                  <button
                    type="button"
                    disabled={page >= tableTotalPages || isTableFetching}
                    onClick={() => goToPage(page + 1)}
                    className="p-1.5 rounded-lg border transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer hover:bg-stone-50"
                    style={{ borderColor: '#E7E5E4', color: '#78716C' }}
                    title="Next page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Last page button */}
                  <button
                    type="button"
                    disabled={page >= tableTotalPages || isTableFetching}
                    onClick={() => goToPage(tableTotalPages)}
                    className="p-1.5 rounded-lg border transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer hover:bg-stone-50"
                    style={{ borderColor: '#E7E5E4', color: '#78716C' }}
                    title="Last page"
                    aria-label="Last page"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Redesigned Card List */}
          <div
            className="space-y-3 sm:hidden transition-opacity duration-150"
            style={{ opacity: isTableFetching ? 0.6 : 1 }}
          >
            {tableData.map((req) => {
              const clientName =
                req.name ||
                `${req.firstName} ${req.lastName}`.trim() ||
                'Client';
              const ageDays = daysInStage(req.statusChangedAt, req.createdAt);
              const stale = isStaleInStage(ageDays);

              return (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="crm-interactive relative rounded-2xl border p-4 transition-all active:scale-[0.99] cursor-pointer"
                  style={{
                    backgroundColor: stale ? '#FFFBEB' : '#FFFFFF',
                    borderColor: stale ? '#FDE68A' : '#E7E5E4',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top row: Client name & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-base leading-tight truncate"
                        style={{ color: '#1C1917' }}
                      >
                        {clientName}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                          style={{
                            backgroundColor: '#FAF9F6',
                            borderColor: '#E7E5E4',
                            color: '#1C1917',
                          }}
                        >
                          {req.service}
                        </span>
                        <div className="inline-flex items-center gap-1 text-xs">
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: PRIORITY_DOT[req.priority] }}
                          />
                          <span style={{ color: '#78716C' }}>{req.priority}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <RequestStatusBadge status={req.status} pipelineStatuses={pipelineStatuses} />
                    </div>
                  </div>

                  {/* Contact info row */}
                  {(req.email || req.phone) && (
                    <div
                      className="mt-3 grid grid-cols-1 gap-1.5 text-xs border-t pt-2.5"
                      style={{ borderColor: stale ? '#FEF3C7' : '#F5F5F4' }}
                    >
                      {req.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: '#A8A29E' }} />
                          <span className="truncate" style={{ color: '#78716C' }}>
                            {req.email}
                          </span>
                        </div>
                      )}
                      {req.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: '#A8A29E' }} />
                          <a
                            href={`tel:${req.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium hover:underline"
                            style={{ color: '#44403C' }}
                          >
                            {req.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meta row: in-stage duration & archive button */}
                  <div
                    className="mt-3 flex items-center justify-between pt-2 border-t text-xs"
                    style={{ borderColor: stale ? '#FEF3C7' : '#F5F5F4' }}
                  >
                    <div
                      className="inline-flex items-center gap-1.5 font-medium tabular-nums"
                      style={{ color: stale ? '#B45309' : '#78716C' }}
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>In stage: {formatStageAge(ageDays)}</span>
                    </div>

                    {onDeleteRequest && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmAction({
                            isOpen: true,
                            title: ARCHIVE_CONFIRM_TITLE,
                            message: archiveConfirmMessage(clientName),
                            confirmText: ARCHIVE_CONFIRM_BUTTON,
                            variant: 'danger',
                            onConfirm: () => handleArchiveRow(req.id),
                          });
                        }}
                        className="p-1.5 rounded-lg cursor-pointer -mr-1"
                        style={{ color: '#B91C1C' }}
                        aria-label="Archive inquiry"
                        title="Archive"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Pagination Bar */}
          {tableTotalPages > 0 && (
            <div
              className="sm:hidden rounded-2xl border p-4 space-y-3"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E7E5E4',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              {/* Page indicator & rows per page selector */}
              <div className="flex items-center justify-between text-xs">
                <div style={{ color: '#78716C' }}>
                  Page <span className="font-semibold" style={{ color: '#1C1917' }}>{page}</span> of{' '}
                  <span className="font-semibold" style={{ color: '#1C1917' }}>{tableTotalPages}</span>
                  <span className="ml-1" style={{ color: '#A8A29E' }}>({tableTotalItems} total)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: '#78716C' }}>Rows:</span>
                  {[10, 25, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (limit !== size) {
                          setLimit(size);
                          setPage(1);
                        }
                      }}
                      className="px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        backgroundColor: limit === size ? '#E02126' : '#F5F5F4',
                        color: limit === size ? '#FFFFFF' : '#78716C',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prev & Next touch buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isTableFetching}
                  onClick={() => goToPage(page - 1)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                  style={{
                    borderColor: '#E7E5E4',
                    backgroundColor: '#FAF9F6',
                    color: '#1C1917',
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= tableTotalPages || isTableFetching}
                  onClick={() => goToPage(page + 1)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                  style={{
                    borderColor: '#E7E5E4',
                    backgroundColor: '#FAF9F6',
                    color: '#1C1917',
                  }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </Enter>

      {/* Mobile Filters Bottom Sheet */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter inquiries"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer content */}
          <div
            className="relative z-10 w-full max-h-[85vh] rounded-t-3xl bg-white shadow-2xl flex flex-col overflow-hidden"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Grab handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-stone-300" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#F5F5F4' }}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" style={{ color: '#E02126' }} />
                <h3 className="text-base font-semibold text-stone-900">
                  Filter Inquiries
                </h3>
                {pendingActiveCount > 0 && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: '#E02126' }}
                  >
                    {pendingActiveCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Sections (Scrollable) */}
            <div className="p-5 space-y-5 overflow-y-auto overscroll-contain max-h-[60vh]">
              {/* Lookback Window */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
                  Time Window
                </label>
                <div className="flex flex-wrap gap-2">
                  {lookbackOptions.map((opt) => {
                    const isSelected = String(pendingLookback) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPendingLookback(Number.parseInt(opt.value, 10) || 0)}
                        className="crm-interactive px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? '#FEE2E2' : '#FAF9F6',
                          borderColor: isSelected ? '#FCA5A5' : '#E7E5E4',
                          color: isSelected ? '#E02126' : '#44403C',
                          fontWeight: isSelected ? 600 : 500,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pipeline Status Filter (Table mode) */}
              {filters.viewMode === 'table' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
                    Pipeline Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((st) => {
                      const isSelected = pendingStatus === st.value;
                      return (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => setPendingStatus(st.value)}
                          className="crm-interactive px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer"
                          style={{
                            backgroundColor: isSelected ? '#FEE2E2' : '#FAF9F6',
                            borderColor: isSelected ? '#FCA5A5' : '#E7E5E4',
                            color: isSelected ? '#E02126' : '#44403C',
                            fontWeight: isSelected ? 600 : 500,
                          }}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sort Order (Table mode) */}
              {filters.viewMode === 'table' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
                    Sort Order
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TABLE_SORT_OPTIONS.map((sortOpt) => {
                      const isSelected = pendingSort === sortOpt.value;
                      return (
                        <button
                          key={sortOpt.value}
                          type="button"
                          onClick={() => setPendingSort(sortOpt.value)}
                          className="crm-interactive px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer text-center"
                          style={{
                            backgroundColor: isSelected ? '#FEE2E2' : '#FAF9F6',
                            borderColor: isSelected ? '#FCA5A5' : '#E7E5E4',
                            color: isSelected ? '#E02126' : '#44403C',
                            fontWeight: isSelected ? 600 : 500,
                          }}
                        >
                          {sortOpt.label.replace('Sort: ', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Service Category */}
              {serviceOptions.length > 1 && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
                    Service
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((svc) => {
                      const isSelected = pendingService === svc.value;
                      return (
                        <button
                          key={svc.value}
                          type="button"
                          onClick={() => setPendingService(svc.value)}
                          className="crm-interactive px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer text-left"
                          style={{
                            backgroundColor: isSelected ? '#FEE2E2' : '#FAF9F6',
                            borderColor: isSelected ? '#FCA5A5' : '#E7E5E4',
                            color: isSelected ? '#E02126' : '#44403C',
                            fontWeight: isSelected ? 600 : 500,
                          }}
                        >
                          {svc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div
              className="p-4 border-t flex items-center gap-3 bg-stone-50/90"
              style={{ borderColor: '#E7E5E4' }}
            >
              <button
                type="button"
                onClick={handleResetMobilePending}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-100 cursor-pointer"
              >
                Reset all
              </button>
              <button
                type="button"
                onClick={handleApplyMobileFilters}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer text-center"
                style={{ backgroundColor: '#E02126' }}
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          variant={confirmAction.variant}
        />
      )}
    </div>
  );
};

/** Read initial view mode for parent state (SSR-safe default). */
export function getInitialInquiriesViewMode(): InquiriesViewMode {
  return readStoredViewMode();
}
