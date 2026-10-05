'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority, PipelineStatus } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CustomSelect } from '../ui/CustomSelect';
import {
  X,
  Copy,
  Check,
  Archive,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertCircle,
  StickyNote,
  ChevronDown,
} from 'lucide-react';
import { Spinner } from '../ui/loading';
import { EmptyState } from '../ui/EmptyState';
import { statusTitle } from '../../lib/adapters';
import { leadSourceHint, leadSourceLabel } from '../../lib/leadSource';
import {
  ARCHIVE_CONFIRM_BUTTON,
  ARCHIVE_CONFIRM_TITLE,
  archiveConfirmMessage,
  RESTORE_CONFIRM_BUTTON,
  RESTORE_CONFIRM_TITLE,
  restoreConfirmMessage,
} from '../../lib/archiveCopy';
import type { LeadNote } from '../../types';

interface RequestDetailModalProps {
  request: ServiceRequest | null;
  pipelineStatuses: PipelineStatus[];
  /** When true, treat the open lead as archived (Restore UI) even if flags are missing. */
  archivedView?: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void | Promise<void | boolean>;
  onUpdatePriority?: (id: string, newPriority: RequestPriority) => void | Promise<void | boolean>;
  onDeleteRequest?: (id: string) => void | Promise<void>;
  onRestoreRequest?: (id: string) => void | Promise<void>;
  onAddNote?: (id: string, note: string) => void | Promise<void>;
}

const PRIORITIES: RequestPriority[] = ['High', 'Medium', 'Low'];

function formatNoteWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown time';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sortNotesNewestFirst(notes: LeadNote[]): LeadNote[] {
  return [...notes].sort((a, b) => {
    const aTime = Date.parse(a.createdAt) || 0;
    const bTime = Date.parse(b.createdAt) || 0;
    return bTime - aTime;
  });
}

function NoteCard({
  note,
  className = '',
  style,
}: {
  note: LeadNote;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <li
      className={`rounded-xl border px-3.5 py-3 ${className}`}
      style={{
        backgroundColor: '#FAF9F6',
        borderColor: '#E7E5E4',
        borderLeftWidth: 3,
        borderLeftColor: '#E02126',
        ...style,
      }}
    >
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: '#1C1917' }}
      >
        {note.text}
      </p>
      <p
        className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[11px]"
        style={{ color: '#A8A29E' }}
      >
        <time dateTime={note.createdAt}>{formatNoteWhen(note.createdAt)}</time>
        {note.createdBy ? (
          <>
            <span aria-hidden>·</span>
            <span>{note.createdBy}</span>
          </>
        ) : null}
      </p>
    </li>
  );
}

type FieldFeedback =
  | { kind: 'saving' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }
  | null;

function FeedbackLine({ feedback }: { feedback: FieldFeedback }) {
  if (!feedback) return null;

  if (feedback.kind === 'saving') {
    return (
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#A8A29E' }}>
        <Spinner size="xs" color="#A8A29E" />
        Saving…
      </div>
    );
  }

  if (feedback.kind === 'success') {
    return (
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#15803D' }}>
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        {feedback.message}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#B91C1C' }}>
      <AlertCircle className="h-3 w-3 shrink-0" />
      {feedback.message}
    </div>
  );
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  pipelineStatuses,
  archivedView = false,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onDeleteRequest,
  onRestoreRequest,
  onAddNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<FieldFeedback>(null);
  const [priorityFeedback, setPriorityFeedback] = useState<FieldFeedback>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priorityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'warning',
    onConfirm: () => {},
  });

  // Reset transient UI when switching leads / closing.
  useEffect(() => {
    setStatusFeedback(null);
    setPriorityFeedback(null);
    setNoteText('');
    setNoteSaved(false);
    setShowAllNotes(false);
    setShowAllActivity(false);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    if (priorityTimerRef.current) clearTimeout(priorityTimerRef.current);
  }, [request?.id]);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (priorityTimerRef.current) clearTimeout(priorityTimerRef.current);
    };
  }, []);

  if (!request) return null;

  const isArchived = Boolean(
    archivedView || request.isDeleted || request.deletedAt
  );

  const displayName =
    request.name ||
    `${request.firstName} ${request.lastName}`.trim() ||
    'Client';

  const submittedAt = new Date(request.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const showTimedFeedback = (
    setFeedback: React.Dispatch<React.SetStateAction<FieldFeedback>>,
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    next: Exclude<FieldFeedback, null>
  ) => {
    setFeedback(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (next.kind === 'success' || next.kind === 'error') {
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        timerRef.current = null;
      }, 2800);
    }
  };

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (isArchived) return;
    if (newStatus === request.status || statusFeedback?.kind === 'saving') return;

    const statusLabel =
      pipelineStatuses.find((s) => s.slug === newStatus)?.title || newStatus;

    // Flush a paint before the network call so Activity updates immediately.
    showTimedFeedback(setStatusFeedback, statusTimerRef, { kind: 'saving' });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    try {
      const ok = await onUpdateStatus(request.id, newStatus);
      if (ok === false) {
        showTimedFeedback(setStatusFeedback, statusTimerRef, {
          kind: 'error',
          message: 'Couldn’t update status. Try again.',
        });
        return;
      }
      showTimedFeedback(setStatusFeedback, statusTimerRef, {
        kind: 'success',
        message: `Status updated to ${statusLabel}`,
      });
    } catch {
      showTimedFeedback(setStatusFeedback, statusTimerRef, {
        kind: 'error',
        message: 'Couldn’t update status. Try again.',
      });
    }
  };

  const handlePriorityChange = async (newPriority: RequestPriority) => {
    if (isArchived) return;
    if (
      newPriority === request.priority ||
      !onUpdatePriority ||
      priorityFeedback?.kind === 'saving'
    ) {
      return;
    }

    showTimedFeedback(setPriorityFeedback, priorityTimerRef, { kind: 'saving' });
    try {
      const ok = await onUpdatePriority(request.id, newPriority);
      if (ok === false) {
        showTimedFeedback(setPriorityFeedback, priorityTimerRef, {
          kind: 'error',
          message: 'Couldn’t update priority. Try again.',
        });
        return;
      }
      showTimedFeedback(setPriorityFeedback, priorityTimerRef, {
        kind: 'success',
        message: `Priority set to ${newPriority}`,
      });
    } catch {
      showTimedFeedback(setPriorityFeedback, priorityTimerRef, {
        kind: 'error',
        message: 'Couldn’t update priority. Try again.',
      });
    }
  };

  const handleDeleteChangeRequest = () => {
    setConfirmAction({
      isOpen: true,
      title: ARCHIVE_CONFIRM_TITLE,
      message: archiveConfirmMessage(displayName),
      confirmText: ARCHIVE_CONFIRM_BUTTON,
      variant: 'danger',
      onConfirm: async () => {
        await onDeleteRequest?.(request.id);
        onClose();
      },
    });
  };

  const handleRestoreRequest = () => {
    const stageLabel =
      pipelineStatuses.find((s) => s.slug === request.status)?.title || request.status;
    setConfirmAction({
      isOpen: true,
      title: RESTORE_CONFIRM_TITLE,
      message: restoreConfirmMessage(displayName, stageLabel),
      confirmText: RESTORE_CONFIRM_BUTTON,
      variant: 'info',
      onConfirm: async () => {
        await onRestoreRequest?.(request.id);
        onClose();
      },
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(request.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived || !noteText.trim() || isSavingNote) return;
    setIsSavingNote(true);
    try {
      await onAddNote?.(request.id, noteText.trim());
      setNoteSaved(true);
      setNoteText('');
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      // Keep draft text so the admin can retry after a failed save.
    } finally {
      setIsSavingNote(false);
    }
  };

  const statusBusy = statusFeedback?.kind === 'saving';
  const priorityBusy = priorityFeedback?.kind === 'saving';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto crm-modal-backdrop"
        style={{ backgroundColor: 'rgba(28, 25, 23, 0.28)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl rounded-2xl my-auto crm-modal-panel"
          style={{
            backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
            boxShadow: '0 16px 40px rgba(28, 25, 23, 0.12)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm" style={{ color: '#78716C' }}>
                  Submitted {submittedAt}
                </p>
                <span
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  title={leadSourceHint(request.source)}
                  style={{
                    color: request.source === 'manual' ? '#57534E' : '#1D4ED8',
                    backgroundColor: request.source === 'manual' ? '#F5F5F4' : '#EFF6FF',
                    borderColor: request.source === 'manual' ? '#E7E5E4' : '#BFDBFE',
                  }}
                >
                  {leadSourceLabel(request.source)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
              style={{ color: '#A8A29E' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className="mx-5 sm:mx-6 h-px"
            style={{ backgroundColor: '#E7E5E4' }}
          />

          {/* Body */}
          <div className="px-5 py-5 sm:px-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/*
              One 3-col grid so row1 (Name/Email/Phone) and row2 (Service/Status/Priority)
              share the same tracks. Email gets a slightly wider track (longer content).
            */}
            <div
              className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)]"
            >
              <div className="min-w-0">
                <p className="text-xs" style={{ color: '#A8A29E' }}>
                  Name
                </p>
                <p
                  className="mt-0.5 font-semibold truncate"
                  style={{ color: 'var(--crm-text-primary, #1C1917)' }}
                >
                  {displayName}
                </p>
                {request.companyName ? (
                  <p className="mt-0.5 text-xs truncate" style={{ color: '#78716C' }}>
                    {request.companyName}
                  </p>
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="text-xs" style={{ color: '#A8A29E' }}>
                  Email
                </p>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="Copy email"
                  className="mt-0.5 inline-flex items-center gap-1.5 max-w-full font-medium transition-colors cursor-pointer"
                  style={{ color: '#1C1917' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#E02126';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1C1917';
                  }}
                >
                  <span className="truncate">{request.email}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#15803D' }} />
                  ) : (
                    <Copy className="w-3.5 h-3.5 shrink-0" style={{ color: '#A8A29E' }} />
                  )}
                </button>
              </div>

              <div className="min-w-0">
                <p className="text-xs" style={{ color: '#A8A29E' }}>
                  Phone
                </p>
                {request.phone ? (
                  <a
                    href={`tel:${request.phone}`}
                    className="mt-0.5 inline-block font-medium tabular-nums transition-colors"
                    style={{ color: '#1C1917' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E02126';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1C1917';
                    }}
                  >
                    {request.phone}
                  </a>
                ) : (
                  <p className="mt-0.5" style={{ color: '#A8A29E' }}>
                    Not provided
                  </p>
                )}
              </div>

              <div className="min-w-0 space-y-1.5">
                <p className="text-xs" style={{ color: '#A8A29E' }}>
                  Service
                </p>
                <p className="font-medium truncate" style={{ color: '#1C1917' }}>
                  {request.service}
                </p>
              </div>

              <div className="space-y-1.5 min-w-0">
                <label className="text-xs" style={{ color: '#A8A29E' }}>
                  Status
                </label>
                {pipelineStatuses.length === 0 ? (
                  <EmptyState
                    compact
                    icon="status"
                    title="No statuses"
                    description="Publish lead statuses in Sanity to enable this control."
                    className="rounded-xl border"
                  />
                ) : (
                  <>
                    {!pipelineStatuses.some((s) => s.slug === request.status) ? (
                      <p className="text-[11px] mb-1" style={{ color: '#B45309' }}>
                        Current status “{request.status}” is off-pipeline. Pick an active
                        stage to move it back on the board.
                      </p>
                    ) : null}
                    <CustomSelect
                      value={request.status}
                      options={[
                        ...(!pipelineStatuses.some((s) => s.slug === request.status)
                          ? [
                              {
                                value: request.status,
                                label: `Unknown · ${request.status}`,
                              },
                            ]
                          : []),
                        ...pipelineStatuses.map((s) => ({
                          value: s.slug,
                          label: s.title,
                        })),
                      ]}
                      onChange={(v) => void handleStatusChange(v)}
                      ariaLabel="Update status"
                      align="left"
                      minWidth={120}
                      disabled={statusBusy || isArchived}
                      className="w-full max-w-[11.5rem] [&>button]:w-full"
                    />
                    <FeedbackLine feedback={statusFeedback} />
                  </>
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <label className="text-xs" style={{ color: '#A8A29E' }}>
                  Priority
                </label>
                <div
                  className="grid grid-cols-3 gap-1 rounded-lg border p-1"
                  style={{
                    borderColor: '#E7E5E4',
                    opacity: priorityBusy ? 0.7 : 1,
                  }}
                >
                  {PRIORITIES.map((p) => {
                    const selected = request.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={priorityBusy || isArchived}
                        onClick={() => void handlePriorityChange(p)}
                        className="rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: selected ? '#FEE2E2' : 'transparent',
                          color: selected ? '#E02126' : '#78716C',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <FeedbackLine feedback={priorityFeedback} />
              </div>
            </div>

            {/* Message */}
            <section className="space-y-2">
              <h3 className="text-xs" style={{ color: '#A8A29E' }}>
                Message
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: request.message ? '#1C1917' : '#A8A29E' }}
              >
                {request.message || 'No message provided'}
              </p>
            </section>

            {/* Notes — latest visible; older notes on demand */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className="inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: '#78716C' }}
                >
                  <StickyNote className="h-3.5 w-3.5" style={{ color: '#A8A29E' }} />
                  Internal notes
                </h3>
                {(request.notes?.length || 0) > 0 && (
                  <span className="text-[11px] tabular-nums" style={{ color: '#A8A29E' }}>
                    {request.notes!.length}{' '}
                    {request.notes!.length === 1 ? 'note' : 'notes'}
                  </span>
                )}
              </div>

              {request.notes && request.notes.length > 0 ? (
                (() => {
                  const sorted = sortNotesNewestFirst(request.notes);
                  const latest = sorted[0];
                  const older = sorted.slice(1);
                  return (
                    <div className="space-y-2">
                      <ul className="space-y-2">
                        <NoteCard note={latest} />
                      </ul>
                      {showAllNotes ? (
                        <ul className="crm-expand-enter space-y-2">
                          {older.map((note, i) => (
                            <NoteCard
                              key={`${note.createdAt}-${i}-${note.text.slice(0, 16)}`}
                              note={note}
                              className="crm-expand-item"
                              style={
                                {
                                  ['--crm-item-i' as string]: i,
                                } as React.CSSProperties
                              }
                            />
                          ))}
                        </ul>
                      ) : null}
                      {older.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAllNotes((v) => !v)}
                          className="crm-interactive inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                          style={{ color: '#78716C' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#E02126';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#78716C';
                          }}
                        >
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                              showAllNotes ? 'rotate-180' : ''
                            }`}
                          />
                          {showAllNotes
                            ? 'Hide earlier notes'
                            : `Show ${older.length} earlier ${
                                older.length === 1 ? 'note' : 'notes'
                              }`}
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p
                  className="rounded-xl border border-dashed px-3.5 py-3 text-sm"
                  style={{ borderColor: '#E7E5E4', color: '#A8A29E' }}
                >
                  No internal notes yet. Add context for teammates here.
                </p>
              )}

              {noteSaved ? (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: '#15803D' }}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Note added
                </div>
              ) : (
                <textarea
                  id="lead-note-input"
                  form="lead-note-form"
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    isArchived
                      ? 'Restore this inquiry to add notes…'
                      : 'Add an internal note…'
                  }
                  disabled={isSavingNote || isArchived}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm leading-relaxed focus:outline-none resize-none disabled:opacity-60"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E7E5E4',
                    color: '#1C1917',
                  }}
                />
              )}
            </section>

            {/* Activity — fully collapsed by default (secondary to notes) */}
            <section className="space-y-2">
              <button
                type="button"
                onClick={() => setShowAllActivity((v) => !v)}
                className="crm-interactive flex w-full items-center justify-between gap-2 text-left cursor-pointer"
                aria-expanded={showAllActivity}
              >
                <h3
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: '#A8A29E' }}
                >
                  Activity
                  {(request.statusHistory?.length || 0) > 0 && (
                    <span className="tabular-nums font-normal">
                      ({request.statusHistory!.length})
                    </span>
                  )}
                </h3>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: '#78716C' }}
                >
                  {showAllActivity ? 'Hide' : 'Show'}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      showAllActivity ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              {showAllActivity ? (
                <div className="crm-expand-enter">
                  {request.statusHistory && request.statusHistory.length > 0 ? (
                    <ol className="space-y-0 border-l" style={{ borderColor: '#E7E5E4' }}>
                      {[...request.statusHistory].reverse().map((entry, index) => {
                        const when = (() => {
                          const d = new Date(entry.changedAt);
                          if (Number.isNaN(d.getTime())) return '—';
                          return d.toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        })();
                        const fromLabel =
                          !entry.fromStatus || entry.fromStatus === 'none'
                            ? 'New inquiry'
                            : statusTitle(pipelineStatuses, entry.fromStatus);
                        const toLabel = statusTitle(pipelineStatuses, entry.toStatus);
                        const isLatest = index === 0;
                        return (
                          <li
                            key={`${entry.changedAt}-${entry.toStatus}-${index}`}
                            className="crm-expand-item relative pl-4 py-2"
                            style={
                              {
                                ['--crm-item-i' as string]: index,
                              } as React.CSSProperties
                            }
                          >
                            <span
                              className="absolute left-0 top-3 h-2 w-2 -translate-x-1/2 rounded-full border"
                              style={{
                                backgroundColor: isLatest ? '#E02126' : '#FFFFFF',
                                borderColor: isLatest ? '#E02126' : '#D6D3D1',
                              }}
                            />
                            <p className="text-sm" style={{ color: '#1C1917' }}>
                              {fromLabel === 'New inquiry' ? (
                                <>
                                  Opened as <span className="font-medium">{toLabel}</span>
                                </>
                              ) : (
                                <>
                                  Moved from <span className="font-medium">{fromLabel}</span> to{' '}
                                  <span className="font-medium">{toLabel}</span>
                                </>
                              )}
                            </p>
                            <p className="mt-0.5 text-[11px]" style={{ color: '#A8A29E' }}>
                              {when}
                              {entry.changedBy ? ` · ${entry.changedBy}` : ''}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="text-sm" style={{ color: '#A8A29E' }}>
                      No status changes recorded yet.
                    </p>
                  )}
                </div>
              ) : null}
            </section>
          </div>

          {/* Footer */}
          <form
            id="lead-note-form"
            onSubmit={handleAddNote}
            className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 border-t"
            style={{ borderColor: '#E7E5E4' }}
          >
            {isArchived ? (
              <button
                type="button"
                onClick={handleRestoreRequest}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
                style={{ color: '#15803D' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeleteChangeRequest}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
                style={{ color: '#B91C1C' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer"
                style={{ color: '#78716C' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F5F4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Close
              </button>
              {!isArchived ? (
                <button
                  type="submit"
                  disabled={!noteText.trim() || isSavingNote || noteSaved}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-opacity cursor-pointer disabled:opacity-40 hover:opacity-90"
                  style={{ backgroundColor: '#E02126' }}
                >
                  {isSavingNote ? (
                    <>
                      <Spinner size="xs" color="#FFFFFF" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Add note
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.confirmText}
        variant={confirmAction.variant}
      />
    </>
  );
};
