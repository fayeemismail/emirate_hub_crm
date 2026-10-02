'use client';

import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { PipelineStatus, ServiceRequest } from '../../types';
import { getOrphanRequests } from '../../lib/orphans';
import { EmptyState } from '../ui/EmptyState';
import { LoadingOverlay, TableSkeleton } from '../ui/loading';

interface OrphanRequestsViewProps {
  requests: ServiceRequest[];
  pipelineStatuses: PipelineStatus[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onSelectRequest: (req: ServiceRequest) => void;
}

function clientNameOf(req: ServiceRequest) {
  return req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client';
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function groupByStatus(orphans: ServiceRequest[]): [string, ServiceRequest[]][] {
  const map = new Map<string, ServiceRequest[]>();
  for (const req of orphans) {
    const key = req.status || 'unknown';
    const list = map.get(key) ?? [];
    list.push(req);
    map.set(key, list);
  }
  return [...map.entries()].sort((a, b) => {
    if (b[1].length !== a[1].length) return b[1].length - a[1].length;
    return a[0].localeCompare(b[0]);
  });
}

export const OrphanRequestsView: React.FC<OrphanRequestsViewProps> = ({
  requests,
  pipelineStatuses,
  isLoading = false,
  isRefreshing = false,
  onSelectRequest,
}) => {
  const orphans = useMemo(
    () => getOrphanRequests(requests, pipelineStatuses),
    [requests, pipelineStatuses]
  );
  const groups = useMemo(() => groupByStatus(orphans), [orphans]);

  return (
    <div className="relative space-y-4">
      <LoadingOverlay
        visible={isRefreshing && !isLoading}
        label="Refreshing…"
      />

      <div>
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Needs reassignment
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: '#78716C' }}>
          {isLoading
            ? 'Loading…'
            : orphans.length === 0
              ? 'All inquiries use an active pipeline stage'
              : `${orphans.length} to move onto a live stage`}
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : orphans.length === 0 ? (
        <EmptyState
          icon="status"
          title="Nothing to reassign"
          description="All inquiries use an active pipeline stage."
        />
      ) : (
        <div className="space-y-4">
          {groups.map(([status, items]) => (
            <section key={status}>
              <div className="mb-1.5 flex items-center gap-2 px-0.5">
                <span
                  className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    color: '#B45309',
                    backgroundColor: '#FEF3C7',
                    borderColor: '#FDE68A',
                  }}
                >
                  {status}
                </span>
                <span className="text-[11px] tabular-nums" style={{ color: '#A8A29E' }}>
                  {items.length}
                </span>
              </div>

              <ul
                className="rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E7E5E4',
                }}
              >
                {items.map((req) => {
                  const name = clientNameOf(req);
                  return (
                    <li key={req.id}>
                      <button
                        type="button"
                        onClick={() => onSelectRequest(req)}
                        className="group w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer transition-colors hover:bg-[#FAF9F6]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: '#1C1917' }}
                            >
                              {name}
                            </p>
                            <time
                              className="text-[11px] tabular-nums shrink-0"
                              style={{ color: '#A8A29E' }}
                              dateTime={req.createdAt}
                            >
                              {formatWhen(req.createdAt)}
                            </time>
                          </div>
                          <p
                            className="text-xs truncate"
                            style={{ color: '#78716C' }}
                          >
                            {req.service || '—'}
                            {req.email ? ` · ${req.email}` : ''}
                          </p>
                        </div>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--crm-accent-primary, #E02126)' }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
