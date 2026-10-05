'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw, Search } from 'lucide-react';
import { PipelineStatus, ServiceRequest } from '../../types';
import { leadsApi } from '../../lib/api';
import { leadToServiceRequest } from '../../lib/adapters';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ArchivesPageSkeleton, LoadingOverlay, Spinner } from '../ui/loading';
import { RequestStatusBadge } from '../ui/RequestStatusBadge';

interface ArchivesViewProps {
  pipelineStatuses: PipelineStatus[];
  /** Bump to reload the archived list (e.g. after restore from the detail modal). */
  refreshKey?: number;
  /** Refresh active inquiries after a successful restore. */
  onRestored: () => void | Promise<void>;
  onSelectRequest: (req: ServiceRequest) => void;
}

function clientNameOf(req: ServiceRequest) {
  return req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client';
}

function formatWhen(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const ArchivesView: React.FC<ArchivesViewProps> = ({
  pipelineStatuses,
  refreshKey = 0,
  onRestored,
  onSelectRequest,
}) => {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null
  );
  const loadGen = useRef(0);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const showBanner = (kind: 'success' | 'error', message: string) => {
    setBanner({ kind, message });
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setBanner(null);
      successTimerRef.current = null;
    }, 3200);
  };

  const loadArchived = useCallback(async () => {
    const gen = ++loadGen.current;
    setIsLoading((prev) => (items.length === 0 ? true : prev));
    setIsRefreshing(items.length > 0);

    try {
      const res = await leadsApi.getAdminLeads({
        view: 'list',
        archived: true,
        page: 1,
        limit: 100,
        sortBy: 'deletedAt',
        sortOrder: 'desc',
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });

      if (gen !== loadGen.current) return;

      const raw = Array.isArray(res.data) ? res.data : [];
      const mapped = raw
        .map((lead) => leadToServiceRequest(lead))
        .filter((req) => Boolean(req.isDeleted));
      setItems(mapped);
      setTotal(res.pagination?.totalItems ?? mapped.length);
    } catch (err: unknown) {
      if (gen !== loadGen.current) return;
      const message = err instanceof Error ? err.message : 'Could not load archives.';
      showBanner('error', message);
      setItems([]);
      setTotal(0);
    } finally {
      if (gen === loadGen.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
    // items.length only gates initial vs refresh spinner; omit from deps to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, refreshKey]);

  useEffect(() => {
    loadArchived();
  }, [loadArchived]);

  const stageTitle = useCallback(
    (slug: string) =>
      pipelineStatuses.find((s) => s.slug === slug)?.title || slug || '—',
    [pipelineStatuses]
  );

  const confirmTarget = useMemo(
    () => items.find((r) => r.id === confirmId) ?? null,
    [items, confirmId]
  );

  const handleRestore = async () => {
    if (!confirmTarget) return;
    const id = confirmTarget.id;
    const name = clientNameOf(confirmTarget);
    setRestoringId(id);

    try {
      await leadsApi.restoreLead(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmId(null);
      showBanner('success', `"${name}" restored to the board`);
      await onRestored();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not restore inquiry.';
      showBanner('error', message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="relative space-y-4">
      <LoadingOverlay visible={isRefreshing && !isLoading} label="Refreshing archives…" />

      {isLoading ? (
        <ArchivesPageSkeleton />
      ) : (
        <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2
            className="text-lg font-semibold tracking-tight"
            style={{ color: '#1C1917' }}
          >
            Archives
          </h2>
          {total > 0 ? (
            <span className="text-xs tabular-nums" style={{ color: '#A8A29E' }}>
              {total}
            </span>
          ) : null}
        </div>

        <label className="relative block w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: '#A8A29E' }}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archives…"
            className="w-full rounded-lg border py-1.5 pl-8 pr-3 text-sm outline-none"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E7E5E4',
              color: '#1C1917',
            }}
          />
        </label>
      </div>

      {banner ? (
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: banner.kind === 'success' ? '#15803D' : '#B91C1C' }}
          role="status"
        >
          {banner.kind === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : null}
          <span>{banner.message}</span>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={debouncedSearch ? 'No matches' : 'Archives empty'}
          description={
            debouncedSearch
              ? 'Try a different search term.'
              : 'Archived inquiries show up here. Restore puts them back on the board.'
          }
          compact
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
                  <th className="py-2.5 px-4 font-medium">Name</th>
                  <th className="py-2.5 px-4 font-medium">Email</th>
                  <th className="py-2.5 px-4 font-medium">Service</th>
                  <th className="py-2.5 px-4 font-medium">Stage</th>
                  <th className="py-2.5 px-4 font-medium">Archived</th>
                  <th className="py-2.5 px-4 font-medium text-right w-28"> </th>
                </tr>
              </thead>
              <tbody>
                {items.map((req) => {
                  const name = clientNameOf(req);
                  const busy = restoringId === req.id;
                  const archivedAt = req.deletedAt || req.updatedAt;

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req)}
                      className="border-b last:border-b-0 cursor-pointer crm-interactive"
                      style={{
                        borderColor: '#F5F5F4',
                        opacity: busy ? 0.65 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FAFAF9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="py-2.5 px-4">
                        <span
                          className="block truncate text-sm font-medium max-w-[10rem]"
                          style={{ color: '#1C1917' }}
                        >
                          {name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className="block truncate text-sm max-w-[12rem]"
                          style={{ color: '#78716C' }}
                        >
                          {req.email || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className="block truncate text-sm max-w-[10rem]"
                          style={{ color: '#57534E' }}
                        >
                          {req.service || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <RequestStatusBadge
                          status={req.status}
                          pipelineStatuses={pipelineStatuses}
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className="text-sm tabular-nums whitespace-nowrap"
                          style={{ color: '#78716C' }}
                        >
                          {formatWhen(archivedAt)}
                        </span>
                      </td>
                      <td
                        className="py-2.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmId(req.id)}
                          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer disabled:opacity-50 hover:opacity-90"
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E7E5E4',
                            color: '#15803D',
                          }}
                        >
                          {busy ? (
                            <>
                              <Spinner size="xs" />
                              …
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-3 w-3" />
                              Restore
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => {
          if (!restoringId) setConfirmId(null);
        }}
        onConfirm={handleRestore}
        title="Restore inquiry?"
        message={
          confirmTarget
            ? `"${clientNameOf(confirmTarget)}" will return to the board on stage “${stageTitle(confirmTarget.status)}”.`
            : ''
        }
        confirmText="Restore"
        variant="info"
      />
    </div>
  );
};
