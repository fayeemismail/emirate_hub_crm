'use client';

import React, { useMemo } from 'react';
import { ServicePerformanceItem } from '../../../types';
import { DemandSkeleton } from '../../ui/loading';
import { EmptyState } from '../../ui/EmptyState';

interface DemandBreakdownProps {
  services?: ServicePerformanceItem[];
  isLoading?: boolean;
}

export const DemandBreakdown: React.FC<DemandBreakdownProps> = ({
  services = [],
  isLoading = false,
}) => {
  const ranked = useMemo(
    () => [...services].sort((a, b) => b.totalInquiries - a.totalInquiries).slice(0, 6),
    [services]
  );

  const top = ranked[0];
  const rest = ranked.slice(1);

  if (isLoading) {
    return <DemandSkeleton />;
  }

  return (
    <div
      className="rounded-2xl border px-5 py-5"
      style={{
        backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
        borderColor: 'var(--crm-card-border, #E7E5E4)',
      }}
    >
      <h3
        className="text-base font-semibold tracking-tight"
        style={{ color: 'var(--crm-text-primary, #1C1917)' }}
      >
        Demand
      </h3>
      <p className="mt-0.5 text-sm" style={{ color: '#78716C' }}>
        Share of inquiries by service
      </p>

      {ranked.length === 0 ? (
        <EmptyState
          compact
          icon="chart"
          title="No demand data yet"
          description="Service breakdown appears once inquiries start coming in."
        />
      ) : (
        <div className="mt-6">
          {top && (
            <div
              className="rounded-xl px-4 py-4 mb-2"
              style={{ backgroundColor: '#FAF9F6' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A8A29E' }}>
                Leading
              </p>
              <p
                className="mt-1 text-sm font-medium truncate"
                style={{ color: 'var(--crm-text-primary, #1C1917)' }}
              >
                {top.service}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className="text-3xl font-semibold tabular-nums tracking-tight"
                  style={{ color: 'var(--crm-accent-primary, #E02126)' }}
                >
                  {top.sharePercentage}%
                </span>
                <span className="text-sm tabular-nums" style={{ color: '#78716C' }}>
                  {top.totalInquiries} leads
                </span>
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <ul className="mt-1">
              {rest.map((item, index) => (
                <li
                  key={item.service}
                  className="flex items-center justify-between gap-3 py-2.5"
                  style={{
                    borderTop: index === 0 ? '1px solid #F5F5F4' : undefined,
                    borderBottom: '1px solid #F5F5F4',
                  }}
                >
                  <span
                    className="min-w-0 truncate text-sm"
                    style={{ color: 'var(--crm-text-primary, #1C1917)' }}
                  >
                    {item.service}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums" style={{ color: '#78716C' }}>
                    {item.sharePercentage}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
