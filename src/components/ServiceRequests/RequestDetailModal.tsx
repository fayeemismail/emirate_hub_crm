'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CustomSelect } from '../ui/CustomSelect';
import {
  X,
  Copy,
  Check,
  Trash2,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Spinner } from '../ui/loading';

interface RequestDetailModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void | Promise<void | boolean>;
  onUpdatePriority?: (id: string, newPriority: RequestPriority) => void | Promise<void>;
  onDeleteRequest?: (id: string) => void | Promise<void>;
  onAddNote?: (id: string, note: string) => void | Promise<void>;
}

const STATUS_OPTIONS = [
  { value: 'Pending' as const, label: 'Pending' },
  { value: 'In Progress' as const, label: 'In Progress' },
  { value: 'Resolved' as const, label: 'Resolved' },
];

const PRIORITIES: RequestPriority[] = ['High', 'Medium', 'Low'];

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onDeleteRequest,
  onAddNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

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

  if (!request) return null;

  const displayName =
    request.name ||
    `${request.firstName} ${request.lastName}`.trim() ||
    'Client';

  const submittedAt = new Date(request.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleStatusChange = (newStatus: RequestStatus) => {
    if (newStatus === request.status) return;
    void onUpdateStatus(request.id, newStatus);
  };

  const handlePriorityChange = (newPriority: RequestPriority) => {
    if (newPriority === request.priority) return;
    void onUpdatePriority?.(request.id, newPriority);
  };

  const handleDeleteChangeRequest = () => {
    setConfirmAction({
      isOpen: true,
      title: 'Delete inquiry?',
      message: `Archive the inquiry from ${displayName}. It will be hidden from active views.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await onDeleteRequest?.(request.id);
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
    if (!noteText.trim() || isSavingNote) return;
    setIsSavingNote(true);
    try {
      await onAddNote?.(request.id, noteText.trim());
      setNoteSaved(true);
      setNoteText('');
      setTimeout(() => setNoteSaved(false), 2000);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        style={{ backgroundColor: 'rgba(28, 25, 23, 0.28)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl rounded-2xl my-auto animate-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
            boxShadow: '0 16px 40px rgba(28, 25, 23, 0.12)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
            <p className="text-sm" style={{ color: '#78716C' }}>
              Submitted {submittedAt}
            </p>
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
            {/* Name · Email · Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
            </div>

            {/* Service · Status · Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs" style={{ color: '#A8A29E' }}>
                  Service
                </p>
                <p className="font-medium truncate text-sm" style={{ color: '#1C1917' }}>
                  {request.service}
                </p>
              </div>

              <div className="space-y-1.5 min-w-0">
                <label className="text-xs" style={{ color: '#A8A29E' }}>
                  Status
                </label>
                <CustomSelect
                  value={request.status as 'Pending' | 'In Progress' | 'Resolved'}
                  options={STATUS_OPTIONS}
                  onChange={(v) => handleStatusChange(v)}
                  ariaLabel="Update status"
                  align="left"
                  minWidth={120}
                  className="w-full [&>button]:w-full"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <label className="text-xs" style={{ color: '#A8A29E' }}>
                  Priority
                </label>
                <div
                  className="grid grid-cols-3 gap-1 rounded-lg border p-1"
                  style={{ borderColor: '#E7E5E4' }}
                >
                  {PRIORITIES.map((p) => {
                    const selected = request.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePriorityChange(p)}
                        className="rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer"
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

            {/* Notes */}
            <section className="space-y-2">
              <h3 className="text-xs" style={{ color: '#A8A29E' }}>
                Notes
              </h3>

              {request.notes && request.notes.length > 0 && (
                <ul className="space-y-1.5 mb-2">
                  {request.notes.map((note, i) => (
                    <li
                      key={`${i}-${note.slice(0, 12)}`}
                      className="text-sm leading-relaxed"
                      style={{ color: '#1C1917' }}
                    >
                      {note}
                    </li>
                  ))}
                </ul>
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
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an internal note…"
                  disabled={isSavingNote}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm leading-relaxed focus:outline-none resize-none disabled:opacity-60"
                  style={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E7E5E4',
                    color: '#1C1917',
                  }}
                />
              )}
            </section>
          </div>

          {/* Footer */}
          <form
            id="lead-note-form"
            onSubmit={handleAddNote}
            className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 border-t"
            style={{ borderColor: '#E7E5E4' }}
          >
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
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>

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
