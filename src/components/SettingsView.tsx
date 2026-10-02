'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { LOOKBACK_PRESETS } from '../lib/crmSettings';
import { useCrmSettings } from '../hooks/useCrmSettings';

export const SettingsView: React.FC = () => {
  const { lookbackDays, setLookbackDays } = useCrmSettings();
  const [draft, setDraft] = useState(String(lookbackDays));

  React.useEffect(() => {
    setDraft(String(lookbackDays));
  }, [lookbackDays]);

  const applyDraft = () => {
    const n = Number.parseInt(draft, 10);
    if (!Number.isFinite(n) || n < 0) {
      setDraft(String(lookbackDays));
      return;
    }
    setLookbackDays(n);
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
          Preferences for this CRM workspace (saved in this browser).
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

        <div className="flex flex-wrap gap-2">
          {LOOKBACK_PRESETS.map((days) => {
            const active = lookbackDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => setLookbackDays(days)}
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
            onClick={() => setLookbackDays(0)}
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
                borderColor: '#E7E5E4',
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
            {lookbackDays === 0 ? 'All time' : `Last ${lookbackDays} days`}
          </span>
        </p>
      </section>
    </div>
  );
};
