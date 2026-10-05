'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  UserRound,
} from 'lucide-react';
import { LOOKBACK_PRESETS, lookbackLabel } from '../lib/crmSettings';
import { useCrmSettings } from '../hooks/useCrmSettings';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/loading';
import { FormModal } from './ui/FormModal';
import { TeamUsersSection } from './TeamUsersSection';

type Feedback =
  | null
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <div
      className="crm-feedback-enter flex items-start gap-1.5 text-xs"
      style={{ color: feedback.kind === 'error' ? '#B91C1C' : '#15803D' }}
      role={feedback.kind === 'error' ? 'alert' : 'status'}
    >
      {feedback.kind === 'success' ? (
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <span>{feedback.message}</span>
    </div>
  );
}

function fieldStyle(hasError?: boolean): React.CSSProperties {
  return {
    borderColor: hasError ? '#FECACA' : '#E7E5E4',
    backgroundColor: '#FFFFFF',
    color: '#1C1917',
  };
}

function PasswordInput({
  value,
  onChange,
  autoComplete,
  hasError,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hasError?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-lg border py-2 pl-3 pr-10 text-sm focus:outline-none"
        style={fieldStyle(hasError)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 hover:opacity-70"
        style={{ color: '#A8A29E' }}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold cursor-pointer"
      style={{ borderColor: '#E7E5E4', backgroundColor: '#FFFFFF', color: '#57534E' }}
    >
      {children}
    </button>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
  busy,
  disabled,
}: {
  onCancel: () => void;
  submitLabel: string;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="rounded-lg px-3.5 py-2.5 text-sm font-medium cursor-pointer disabled:opacity-40"
        style={{ color: '#78716C' }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={busy || disabled}
        className="inline-flex min-w-[6rem] items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:opacity-40"
        style={{ backgroundColor: '#E02126' }}
      >
        {busy ? (
          <>
            <Spinner size="xs" color="#FFFFFF" />
            Saving…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}

type ModalKind = null | 'profile' | 'password';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { lookbackDays, setLookbackDays } = useCrmSettings();

  const [modal, setModal] = useState<ModalKind>(null);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  const [draft, setDraft] = useState(String(lookbackDays));
  const [lookbackFeedback, setLookbackFeedback] = useState<Feedback>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    setDraft(String(lookbackDays));
  }, [lookbackDays]);

  const flashPage = useCallback((next: Feedback) => {
    setPageFeedback(next);
    if (next?.kind === 'success') {
      const t = setTimeout(() => setPageFeedback(null), 2800);
      timersRef.current.push(t);
    }
  }, []);

  const flashLookback = (next: Feedback) => {
    setLookbackFeedback(next);
    if (next?.kind === 'success') {
      const t = setTimeout(() => setLookbackFeedback(null), 2800);
      timersRef.current.push(t);
    }
  };

  const openProfile = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setProfileFeedback(null);
    setModal('profile');
  };

  const openPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback(null);
    setModal('password');
  };

  const closeModal = () => {
    if (profileSaving || passwordSaving) return;
    setModal(null);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileSaving) return;
    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();
    if (!nextName) {
      setProfileFeedback({ kind: 'error', message: 'Name is required.' });
      return;
    }
    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setProfileFeedback({ kind: 'error', message: 'Enter a valid email address.' });
      return;
    }
    setProfileSaving(true);
    setProfileFeedback(null);
    try {
      await updateProfile({ name: nextName, email: nextEmail });
      setModal(null);
      flashPage({ kind: 'success', message: 'Profile updated.' });
    } catch (err: unknown) {
      setProfileFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordSaving) return;
    if (!currentPassword) {
      setPasswordFeedback({ kind: 'error', message: 'Enter your current password.' });
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordFeedback({
        kind: 'error',
        message: 'New password needs 8+ characters with a letter and a number.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ kind: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordFeedback({
        kind: 'error',
        message: 'New password must be different from the current password.',
      });
      return;
    }
    setPasswordSaving(true);
    setPasswordFeedback(null);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setModal(null);
      flashPage({ kind: 'success', message: 'Password changed.' });
    } catch (err: unknown) {
      setPasswordFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not change password.',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const applyLookback = (days: number) => {
    if (!Number.isFinite(days) || days < 0) {
      flashLookback({
        kind: 'error',
        message: 'Enter a valid number of days (0 = all time).',
      });
      setDraft(String(lookbackDays));
      return;
    }
    const clamped = Math.max(0, Math.min(Math.floor(days), 3650));
    setLookbackDays(clamped);
    setDraft(String(clamped));
    flashLookback({
      kind: 'success',
      message: `Lookback set to ${lookbackLabel(clamped)}.`,
    });
  };

  const saveLookbackDraft = () => {
    const n = Number.parseInt(draft, 10);
    if (!Number.isFinite(n) || draft.trim() === '') {
      flashLookback({
        kind: 'error',
        message: 'Enter a valid number of days (0 = all time).',
      });
      setDraft(String(lookbackDays));
      return;
    }
    applyLookback(n);
  };

  const initials = (user?.name?.trim()?.charAt(0) || user?.email?.charAt(0) || 'A').toUpperCase();

  return (
    <div className="space-y-5">
      <header>
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Settings
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: '#78716C' }}>
          Account on the server · preferences on this device
        </p>
      </header>

      {pageFeedback ? <FeedbackLine feedback={pageFeedback} /> : null}

      {/* Account — compact strip, no empty stretch */}
      <div
        className="rounded-2xl border px-5 py-4"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: '#E02126' }}
              aria-hidden
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: '#A8A29E' }}>
                Admin profile
              </p>
              <p
                className="truncate text-[15px] font-semibold tracking-tight"
                style={{ color: '#1C1917' }}
              >
                {user?.name || '—'}
              </p>
              <p className="truncate text-sm" style={{ color: '#78716C' }}>
                {user?.email || '—'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <GhostButton onClick={openProfile}>
              <UserRound className="h-3.5 w-3.5" />
              Edit profile
            </GhostButton>
            <GhostButton onClick={openPassword}>
              <KeyRound className="h-3.5 w-3.5" />
              Change password
            </GhostButton>
          </div>
        </div>
      </div>

      {/* Lookback */}
      <div
        className="rounded-2xl border px-5 py-5 space-y-3.5"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5" style={{ color: '#78716C' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                Inquiry lookback
              </h3>
            </div>
            <p className="mt-1 text-xs" style={{ color: '#A8A29E' }}>
              How far back Service Inquiries loads. Stored on this browser only.
            </p>
          </div>
          <p className="text-xs font-medium shrink-0" style={{ color: '#78716C' }}>
            Current ·{' '}
            <span style={{ color: '#1C1917' }}>{lookbackLabel(lookbackDays)}</span>
          </p>
        </div>

        <FeedbackLine feedback={lookbackFeedback} />

        <div className="flex flex-wrap gap-2">
          {LOOKBACK_PRESETS.map((days) => {
            const active = lookbackDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => applyLookback(days)}
                className="rounded-lg border px-3.5 py-2.5 text-sm font-medium cursor-pointer"
                style={{
                  borderColor: active ? '#E02126' : '#E7E5E4',
                  backgroundColor: active ? '#FEE2E2' : '#FFFFFF',
                  color: active ? '#E02126' : '#78716C',
                }}
              >
                {lookbackLabel(days)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => applyLookback(0)}
            className="rounded-lg border px-3.5 py-2.5 text-sm font-medium cursor-pointer"
            style={{
              borderColor: lookbackDays === 0 ? '#E02126' : '#E7E5E4',
              backgroundColor: lookbackDays === 0 ? '#FEE2E2' : '#FFFFFF',
              color: lookbackDays === 0 ? '#E02126' : '#78716C',
            }}
          >
            All time
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex w-[7.5rem] flex-col gap-1">
            <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
              Custom days
            </span>
            <input
              type="number"
              min={0}
              max={3650}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveLookbackDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveLookbackDraft();
                }
              }}
              className="w-full rounded-lg border px-3 py-2.5 text-sm tabular-nums focus:outline-none"
              style={fieldStyle(lookbackFeedback?.kind === 'error')}
            />
          </label>
          <button
            type="button"
            onClick={saveLookbackDraft}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: '#E02126' }}
          >
            Save
          </button>
        </div>
      </div>

      <TeamUsersSection onToast={flashPage} />

      {/* Profile modal */}
      <FormModal
        isOpen={modal === 'profile'}
        onClose={closeModal}
        title="Edit profile"
        description="Name and email used for sign-in and the sidebar."
        busy={profileSaving}
      >
        <form onSubmit={saveProfile} className="space-y-3">
          <FeedbackLine feedback={profileFeedback} />
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={100}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={fieldStyle(profileFeedback?.kind === 'error')}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={fieldStyle(profileFeedback?.kind === 'error')}
            />
          </label>
          <ModalActions
            onCancel={closeModal}
            submitLabel="Save"
            busy={profileSaving}
            disabled={
              name.trim() === (user?.name || '').trim() &&
              email.trim().toLowerCase() === (user?.email || '').trim().toLowerCase()
            }
          />
        </form>
      </FormModal>

      {/* Password modal */}
      <FormModal
        isOpen={modal === 'password'}
        onClose={closeModal}
        title="Change password"
        description="Min 8 characters with at least one letter and one number."
        busy={passwordSaving}
      >
        <form onSubmit={savePassword} className="space-y-3">
          <FeedbackLine feedback={passwordFeedback} />
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
              Current password
            </span>
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              hasError={passwordFeedback?.kind === 'error'}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
              New password
            </span>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              hasError={passwordFeedback?.kind === 'error'}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
              Confirm new password
            </span>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              hasError={passwordFeedback?.kind === 'error'}
            />
          </label>
          <ModalActions
            onCancel={closeModal}
            submitLabel="Update"
            busy={passwordSaving}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          />
        </form>
      </FormModal>
    </div>
  );
};
