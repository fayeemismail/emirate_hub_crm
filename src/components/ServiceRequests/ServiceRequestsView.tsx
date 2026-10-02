'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { sortByPriorityDesc, sortByBoardOrder } from '../../lib/adapters';
import { KanbanBoard } from './KanbanBoard';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CustomSelect } from '../ui/CustomSelect';
import { RequestStatusBadge } from '../ui/RequestStatusBadge';
import { KanbanSkeleton, TableSkeleton, LoadingOverlay } from '../ui/loading';
import {
  Search,
  Inbox,
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

interface ServiceRequestsViewProps {
  requests: ServiceRequest[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectRequest: (req: ServiceRequest) => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus, boardOrder?: number) => void | Promise<boolean | void>;
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

export const ServiceRequestsView: React.FC<ServiceRequestsViewProps> = ({
  requests,
  isLoading = false,
  isRefreshing = false,
  searchTerm,
  setSearchTerm,
  onSelectRequest,
  onUpdateStatus,
  onKanbanSync,
  onDeleteRequest,
}) => {
  const [selectedService, setSelectedService] = useState<string>('All');
  const [viewMode, setViewModeState] = useState<InquiriesViewMode>(() => readStoredViewMode());

  useEffect(() => {
    persistViewMode(viewMode);
  }, [viewMode]);

  const setViewMode = useCallback((mode: InquiriesViewMode) => {
    setViewModeState(mode);
  }, []);

  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const servicesList = Array.from(new Set(requests.map((r) => r.service)));

  const serviceOptions = [
    { value: 'All', label: 'All services' },
    ...servicesList.map((svc) => ({ value: svc, label: svc })),
  ];

  const filteredRequests = requests.filter((r) => {
    if (selectedService !== 'All' && r.service !== selectedService) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const clientName = (r.name || `${r.firstName} ${r.lastName}`).toLowerCase();
      return (
        clientName.includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        (r.message || '').toLowerCase().includes(q)
      );
    }

    return true;
  });

  const sortedRequests = [...filteredRequests].sort(sortByPriorityDesc);
  const boardRequests = [...filteredRequests].sort(sortByBoardOrder);

  const hasActiveFilters =
    searchTerm.trim().length > 0 || selectedService !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedService('All');
  };

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
          {requests.length} total
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {servicesList.length > 0 && (
            <CustomSelect
              value={selectedService}
              options={serviceOptions}
              onChange={setSelectedService}
              ariaLabel="Filter by service"
              minWidth={150}
              align="right"
            />
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0"
              style={{
                borderColor: '#E7E5E4',
                color: '#78716C',
                backgroundColor: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </button>
          )}

          <div
            className="inline-flex rounded-lg border p-0.5"
            style={{ borderColor: '#E7E5E4' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: viewMode === 'kanban' ? '#FEE2E2' : 'transparent',
                color: viewMode === 'kanban' ? '#E02126' : '#78716C',
              }}
            >
              <Kanban className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: viewMode === 'table' ? '#FEE2E2' : 'transparent',
                color: viewMode === 'table' ? '#E02126' : '#78716C',
              }}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'kanban' ? (
          <KanbanSkeleton />
        ) : (
          <TableSkeleton />
        )
      ) : sortedRequests.length === 0 ? (
        <div className="py-16 text-center">
          <Inbox className="mx-auto h-8 w-8" style={{ color: '#D6D3D1' }} />
          <p className="mt-3 text-sm font-medium" style={{ color: '#1C1917' }}>
            {requests.length === 0 ? 'No inquiries yet' : 'No matching inquiries'}
          </p>
          <p className="mt-1 text-sm" style={{ color: '#78716C' }}>
            {requests.length === 0
              ? 'New leads from the website will show up here.'
              : 'Try clearing search or filters.'}
          </p>
          {requests.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedService('All');
              }}
              className="mt-4 text-sm font-medium cursor-pointer"
              style={{ color: '#E02126' }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          requests={boardRequests}
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
                  <th className="py-3 px-4 font-medium">Priority</th>
                  {onDeleteRequest ? (
                    <th className="py-3 px-4 font-medium text-right w-10"> </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {sortedRequests.map((req) => {
                  const clientName =
                    req.name ||
                    `${req.firstName} ${req.lastName}`.trim() ||
                    'Client';

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req)}
                      className="border-b last:border-b-0 cursor-pointer transition-colors"
                      style={{ borderColor: '#E7E5E4' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FAF9F6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
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
                        <RequestStatusBadge status={req.status} />
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
                                title: 'Delete inquiry?',
                                message: `Archive the inquiry from ${clientName}.`,
                                confirmText: 'Delete',
                                variant: 'danger',
                                onConfirm: () => onDeleteRequest(req.id),
                              });
                            }}
                            className="p-1.5 rounded-lg cursor-pointer"
                            style={{ color: '#B91C1C' }}
                            aria-label="Delete"
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
