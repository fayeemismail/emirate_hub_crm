'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Settings } from 'lucide-react';
import { LOOKBACK_PRESETS } from '../lib/crmSettings';
import { useCrmSettings } from '../hooks/useCrmSettings';

type SaveFeedback =
  | null
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

function lookbackLabel(days: number) {
  return days === 0 ? 'All time' : `Last ${days} days`;
}

export const SettingsView: React.FC = () => {
  const { lookbackDays, setLookbackDays } = useCrmSettings();
  const [draft, setDraft] = useState(String(lookbackDays));
  const [feedback, setFeedback] = useState<SaveFeedback>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(String(lookbackDays));
  }, [lookbackDays]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const flash = (next: SaveFeedback) => {
    setFeedback(next);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (next?.kind === 'success') {
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
        feedbackTimerRef.current = null;
      }, 2800);
    }
  };

  const saveLookback = (days: number) => {
    if (!Number.isFinite(days) || days < 0) {
      flash({
        kind: 'error',
        message: 'Enter a valid number of days (0 = all time).',
      });
      setDraft(String(lookbackDays));
      return;
    }
    const clamped = Math.max(0, Math.min(Math.floor(days), 3650));
    setLookbackDays(clamped);
    setDraft(String(clamped));
    flash({
      kind: 'success',
      message: `Lookback saved — ${lookbackLabel(clamped)}.`,
    });
  };

  const applyDraft = () => {
    const n = Number.parseInt(draft, 10);
    if (!Number.isFinite(n) || n < 0 || draft.trim() === '') {
      flash({
        kind: 'error',
        message: 'Enter a valid number of days (0 = all time).',
      });
      setDraft(String(lookbackDays));
      return;
    }
    saveLookback(n);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2
          className="text-lg font-semibold tracking-tight flex items-center gap-2"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          <Settings className="h-5 w-5" style={{ color: '#78716C' }} />
          Settings
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#78716C' }}>
          Preferences for this device. Lookback is stored in your browser, not shared across
          teammates or other machines.
        </p>
      </div>

      <section
        className="rounded-2xl border px-5 py-5 space-y-4"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E7E5E4',
        }}
      >
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--crm-text-primary, #1C1917)' }}
          >
            Inquiry lookback window
          </h3>
          <p className="mt-1 text-xs" style={{ color: '#78716C' }}>
            Service Inquiries only shows leads created within this many days.
            Use <span className="font-medium">0</span> for all time.
          </p>
        </div>

        <div
          className="flex min-h-[1.25rem] flex-wrap items-center gap-1.5 text-xs"
          style={{
            color:
              feedback?.kind === 'error'
                ? '#B91C1C'
                : feedback?.kind === 'success'
                  ? '#15803D'
                  : '#A8A29E',
          }}
          role={feedback?.kind === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {feedback?.kind === 'success' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{feedback.message}</span>
            </>
          ) : feedback?.kind === 'error' ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 min-w-0">{feedback.message}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="shrink-0 cursor-pointer underline-offset-2 hover:underline"
              >
                Dismiss
              </button>
            </>
          ) : (
            <span>Saved on this device · applies to inquiry lists</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {LOOKBACK_PRESETS.map((days) => {
            const active = lookbackDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => saveLookback(days)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors"
                style={{
                  borderColor: active ? '#E02126' : '#E7E5E4',
                  backgroundColor: active ? '#FEE2E2' : '#FFFFFF',
                  color: active ? '#E02126' : '#78716C',
                }}
              >
                Last {days} days
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => saveLookback(0)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors"
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
          <label className="flex flex-col gap-1 min-w-[8rem]">
            <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
              Custom days
            </span>
            <input
              type="number"
              min={0}
              max={3650}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={applyDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyDraft();
                }
              }}
              className="rounded-lg border px-3 py-1.5 text-sm tabular-nums focus:outline-none"
              style={{
                borderColor: feedback?.kind === 'error' ? '#FECACA' : '#E7E5E4',
                backgroundColor: '#FAF9F6',
                color: '#1C1917',
              }}
            />
          </label>
          <button
            type="button"
            onClick={applyDraft}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer"
            style={{
              borderColor: '#E02126',
              backgroundColor: '#E02126',
              color: '#FFFFFF',
            }}
          >
            Save
          </button>
        </div>

        <p className="text-xs" style={{ color: '#A8A29E' }}>
          Current:{' '}
          <span className="font-medium" style={{ color: '#78716C' }}>
            {lookbackLabel(lookbackDays)}
          </span>
        </p>
      </section>
    </div>
  );
};
