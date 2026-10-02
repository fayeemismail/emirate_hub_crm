'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { PipelineStatus, RequestStatus, ServiceRequest } from '../../types';
import { getOrphanRequests } from '../../lib/orphans';
import { EmptyState } from '../ui/EmptyState';
import { LoadingOverlay, Spinner, TableSkeleton } from '../ui/loading';

interface OrphanRequestsViewProps {
  requests: ServiceRequest[];
  pipelineStatuses: PipelineStatus[];
  defaultStatusSlug?: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onSelectRequest: (req: ServiceRequest) => void;
  onUpdateStatus: (
    id: string,
    newStatus: RequestStatus,
    boardOrder?: number
  ) => void | Promise<boolean | void>;
}

function clientNameOf(req: ServiceRequest) {
  return req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client';
}

function initialFor(name: string) {
  return (name.trim().charAt(0) || '?').toUpperCase();
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
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

type Banner =
  | { kind: 'idle' }
  | { kind: 'saving'; name: string; stageTitle: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export const OrphanRequestsView: React.FC<OrphanRequestsViewProps> = ({
  requests,
  pipelineStatuses,
  defaultStatusSlug = '',
  isLoading = false,
  isRefreshing = false,
  onSelectRequest,
  onUpdateStatus,
}) => {
  const [movingId, setMovingId] = useState<string | null>(null);
  const [movingSlug, setMovingSlug] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null
  );
  const [banner, setBanner] = useState<Banner>({ kind: 'idle' });
  const [tipDismissed, setTipDismissed] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const orphans = useMemo(
    () => getOrphanRequests(requests, pipelineStatuses),
    [requests, pipelineStatuses]
  );
  const groups = useMemo(() => groupByStatus(orphans), [orphans]);

  const liveStages = useMemo(
    () =>
      [...pipelineStatuses]
        .filter((s) => s.isActive !== false)
        .sort((a, b) => a.order - b.order),
    [pipelineStatuses]
  );

  const defaultStage = useMemo(() => {
    const slug =
      defaultStatusSlug ||
      liveStages.find((s) => s.isDefault)?.slug ||
      liveStages[0]?.slug;
    return liveStages.find((s) => s.slug === slug) ?? liveStages[0] ?? null;
  }, [defaultStatusSlug, liveStages]);

  const otherStages = useMemo(
    () => liveStages.filter((s) => s.slug !== defaultStage?.slug),
    [liveStages, defaultStage]
  );

  const stageTitleOf = (slug: string) =>
    liveStages.find((s) => s.slug === slug)?.title || slug;

  const showSuccess = (message: string) => {
    setBanner({ kind: 'success', message });
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setBanner((prev) => (prev.kind === 'success' ? { kind: 'idle' } : prev));
      successTimerRef.current = null;
    }, 3200);
  };

  const moveToStage = async (req: ServiceRequest, slug: string) => {
    if (!slug || movingId) return;
    const name = clientNameOf(req);
    const stageTitle = stageTitleOf(slug);

    setMovingId(req.id);
    setMovingSlug(slug);
    setRowError(null);
    setBanner({ kind: 'saving', name, stageTitle });

    try {
      const ok = await onUpdateStatus(req.id, slug, 0);
      if (ok === false) {
        const message = `Couldn’t move ${name} to ${stageTitle}. Try again.`;
        setRowError({ id: req.id, message: 'Couldn’t move — try again' });
        setBanner({ kind: 'error', message });
        return;
      }
      showSuccess(`Moved ${name} to ${stageTitle}`);
    } catch {
      const message = `Couldn’t move ${name} to ${stageTitle}. Try again.`;
      setRowError({ id: req.id, message: 'Couldn’t move — try again' });
      setBanner({ kind: 'error', message });
    } finally {
      setMovingId(null);
      setMovingSlug(null);
    }
  };

  const stripColor =
    banner.kind === 'error'
      ? '#B91C1C'
      : banner.kind === 'success'
        ? '#15803D'
        : '#A8A29E';

  return (
    <div className="relative space-y-5">
      <LoadingOverlay
        visible={isRefreshing && !isLoading}
        label="Refreshing…"
      />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="text-lg font-semibold tracking-tight"
              style={{ color: 'var(--crm-text-primary, #1C1917)' }}
            >
              Off-pipeline
            </h2>
            {!isLoading && orphans.length > 0 ? (
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                style={{
                  color: '#B45309',
                  backgroundColor: '#FEF3C7',
                  borderColor: '#FDE68A',
                }}
              >
                {orphans.length}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm max-w-xl" style={{ color: '#78716C' }}>
            {isLoading
              ? 'Loading…'
              : orphans.length === 0
                ? 'All inquiries use an active pipeline stage.'
                : 'These inquiries sit on a stage that is no longer in your live pipeline. Move each one onto a current stage.'}
          </p>
        </div>

        {defaultStage && orphans.length > 0 && !isLoading ? (
          <p className="text-xs sm:text-right shrink-0" style={{ color: '#A8A29E' }}>
            Suggested:{' '}
            <span className="font-medium" style={{ color: '#57534E' }}>
              {defaultStage.title}
            </span>
          </p>
        ) : null}
      </header>

      {/* Fixed-height feedback strip — same pattern as kanban */}
      {!isLoading && orphans.length > 0 ? (
        <div
          className="flex min-h-[1.25rem] flex-wrap items-center gap-1.5 text-xs"
          style={{ color: stripColor }}
          role={banner.kind === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {banner.kind === 'saving' ? (
            <>
              <Spinner size="xs" color="#A8A29E" />
              <span>
                Moving {banner.name} to {banner.stageTitle}…
              </span>
            </>
          ) : banner.kind === 'error' ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 min-w-0">{banner.message}</span>
              <button
                type="button"
                onClick={() => setBanner({ kind: 'idle' })}
                className="shrink-0 cursor-pointer underline-offset-2 hover:underline"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </>
          ) : banner.kind === 'success' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{banner.message}</span>
            </>
          ) : (
            <span>Tap a stage to move an inquiry back onto the live board</span>
          )}
        </div>
      ) : null}

      {!isLoading && orphans.length > 0 && !tipDismissed ? (
        <div
          className="flex gap-3 rounded-2xl border px-4 py-3"
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#FDE68A',
          }}
          role="note"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#B45309' }} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color: '#92400E' }}>
              Off-pipeline inquiries
            </p>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#A16207' }}>
              This usually happens after a pipeline stage is renamed or removed in Sanity.
              Moving them onto a live stage puts the inquiry back on the board — it does not
              archive it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTipDismissed(true)}
            className="shrink-0 rounded-lg p-1 cursor-pointer"
            style={{ color: '#A16207' }}
            aria-label="Dismiss tip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : orphans.length === 0 ? (
        <div className="space-y-3">
          {banner.kind === 'success' ? (
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: '#15803D' }}
              role="status"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{banner.message}</span>
            </div>
          ) : null}
          <EmptyState
            icon="status"
            title="Nothing off-pipeline"
            description="All inquiries use an active pipeline stage."
          />
        </div>
      ) : liveStages.length === 0 ? (
        <EmptyState
          icon="pipeline"
          title="No live stages"
          description="Publish pipeline statuses in Sanity before moving these inquiries."
        />
      ) : (
        <div className="space-y-8">
          {groups.map(([status, items]) => (
            <section key={status} className="space-y-3">
              <div className="flex items-center gap-2 px-0.5">
                <AlertTriangle
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: '#B45309' }}
                />
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: '#78716C' }}
                >
                  Former stage
                </p>
                <code
                  className="rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
                  style={{
                    color: '#92400E',
                    backgroundColor: '#FFFBEB',
                    borderColor: '#FDE68A',
                  }}
                >
                  {status}
                </code>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: '#A8A29E' }}
                >
                  {items.length}
                </span>
              </div>

              <ul className="space-y-3">
                {items.map((req) => {
                  const name = clientNameOf(req);
                  const busy = movingId === req.id;
                  const err = rowError?.id === req.id ? rowError.message : null;

                  return (
                    <li
                      key={req.id}
                      className="rounded-2xl border p-4 sm:p-5 transition-colors"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: err
                          ? '#FECACA'
                          : busy
                            ? '#FDE68A'
                            : '#E7E5E4',
                        opacity: movingId && !busy ? 0.72 : 1,
                      }}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                        <button
                          type="button"
                          onClick={() => onSelectRequest(req)}
                          className="group flex min-w-0 flex-1 items-start gap-3 text-left cursor-pointer"
                        >
                          <span
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                            style={{
                              backgroundColor: 'var(--crm-accent-primary, #E02126)',
                            }}
                            aria-hidden
                          >
                            {initialFor(name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: '#1C1917' }}
                              >
                                {name}
                              </p>
                              <time
                                className="text-[11px] tabular-nums"
                                style={{ color: '#A8A29E' }}
                                dateTime={req.createdAt}
                              >
                                {formatWhen(req.createdAt)}
                              </time>
                            </div>
                            <p
                              className="mt-0.5 text-xs truncate"
                              style={{ color: '#78716C' }}
                            >
                              {req.service || 'No service'}
                            </p>
                            <p
                              className="mt-0.5 text-xs truncate"
                              style={{ color: '#A8A29E' }}
                            >
                              {req.email || 'No email'}
                              {req.phone ? ` · ${req.phone}` : ''}
                            </p>
                            <span
                              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium opacity-70 group-hover:opacity-100 transition-opacity"
                              style={{
                                color: 'var(--crm-accent-primary, #E02126)',
                              }}
                            >
                              View details
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </button>

                        <div className="shrink-0 lg:max-w-md lg:pt-0.5">
                          <p
                            className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
                            style={{ color: '#A8A29E' }}
                          >
                            Move to
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {defaultStage ? (
                              <button
                                type="button"
                                disabled={busy || Boolean(movingId)}
                                onClick={() => moveToStage(req, defaultStage.slug)}
                                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundColor: '#E02126',
                                  color: '#FFFFFF',
                                }}
                              >
                                {busy && movingSlug === defaultStage.slug ? (
                                  <Spinner size="xs" color="#FFFFFF" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 opacity-80" />
                                )}
                                {defaultStage.title}
                                <span className="opacity-80 font-medium">· default</span>
                              </button>
                            ) : null}

                            {otherStages.map((stage) => {
                              const stageBusy = busy && movingSlug === stage.slug;
                              return (
                                <button
                                  key={stage.slug}
                                  type="button"
                                  disabled={busy || Boolean(movingId)}
                                  onClick={() => moveToStage(req, stage.slug)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    borderColor: '#E7E5E4',
                                    backgroundColor: '#FAF9F6',
                                    color: '#1C1917',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!busy && !movingId) {
                                      e.currentTarget.style.borderColor = '#D6D3D1';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#E7E5E4';
                                  }}
                                >
                                  {stageBusy ? <Spinner size="xs" /> : null}
                                  {stage.title}
                                </button>
                              );
                            })}
                          </div>

                          {err ? (
                            <p
                              className="mt-2 text-xs"
                              style={{ color: '#B91C1C' }}
                              role="alert"
                            >
                              {err}
                            </p>
                          ) : busy ? (
                            <p className="mt-2 text-[11px]" style={{ color: '#A8A29E' }}>
                              Saving…
                            </p>
                          ) : (
                            <p className="mt-2 text-[11px]" style={{ color: '#A8A29E' }}>
                              One tap moves this inquiry back onto the live board.
                            </p>
                          )}
                        </div>
                      </div>
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
