'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ServiceRequest, RequestPriority, PipelineStatus, CatalogService } from '../../types';
import { LOOKBACK_PRESETS, type TableSortMode } from '../../lib/crmSettings';
import { useCrmSettings } from '../../hooks/useCrmSettings';
import { KanbanBoard } from './KanbanBoard';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CustomSelect } from '../ui/CustomSelect';
import { RequestStatusBadge } from '../ui/RequestStatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { KanbanSkeleton, TableSkeleton, LoadingOverlay } from '../ui/loading';
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
  Trash2,
  RotateCcw,
} from 'lucide-react';

type InquiriesViewMode = 'kanban' | 'table';

const VIEW_STORAGE_KEY = 'emirate_inquiries_view';

function readStoredViewMode(): InquiriesViewMode {
  if (typeof window === 'undefined') return 'kanban';
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('view');
    if (fromUrl === 'table' || fromUrl === 'kanban') return fromUrl;
    const fromStorage = localStorage.getItem(VIEW_STORAGE_KEY);
    if (fromStorage === 'table' || fromStorage === 'kanban') return fromStorage;
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
  { value: 'priority', label: 'Sort: Priority' },
  { value: 'status', label: 'Sort: Status' },
  { value: 'newest', label: 'Sort: Newest' },
  { value: 'oldest', label: 'Sort: Oldest' },
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
        label: `Last ${d} days`,
      })),
      ...(LOOKBACK_PRESETS.includes(lookbackDays as (typeof LOOKBACK_PRESETS)[number]) ||
      lookbackDays === 0
        ? []
        : [{ value: String(lookbackDays), label: `Last ${lookbackDays} days` }]),
      { value: '0', label: 'All time' },
    ],
    [lookbackDays]
  );

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.service !== 'All' ||
    (filters.viewMode === 'table' && filters.status !== 'All');

  const resetFilters = () => {
    setSearchInput('');
    onFiltersChange({ search: '', service: 'All', status: 'All' });
  };

  const rangeLabel =
    lookbackDays === 0 ? 'All time' : `Last ${lookbackDays} days`;

  const shownCount = requests.length;

  return (
    <div className="relative space-y-5">
      <LoadingOverlay visible={isRefreshing && !isLoading} label="Refreshing inquiries…" />

      <div>
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Service inquiries
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#78716C' }}>
          {shownCount} shown
          {' · '}
          {rangeLabel}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors shrink-0"
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
          >
            <button
              type="button"
              onClick={() => onFiltersChange({ viewMode: 'kanban' })}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors"
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
              onClick={() => onFiltersChange({ viewMode: 'table' })}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors"
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

      {isLoading ? (
        filters.viewMode === 'kanban' ? (
          <KanbanSkeleton />
        ) : (
          <TableSkeleton />
        )
      ) : pipelineStatuses.length === 0 ? (
        <EmptyState
          icon="pipeline"
          title="Pipeline not configured"
          description="No lead statuses are available from the CMS yet. Add and publish leadStatus documents in Sanity, then refresh."
        />
      ) : requests.length === 0 ? (
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
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E7E5E4',
          }}
        >
          <div className="overflow-x-auto">
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
                {requests.map((req) => {
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
                      className="border-b last:border-b-0 cursor-pointer transition-colors"
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
                                onConfirm: () => onDeleteRequest(req.id),
                              });
                            }}
                            className="p-1.5 rounded-lg cursor-pointer"
                            style={{ color: '#B91C1C' }}
                            aria-label="Archive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
