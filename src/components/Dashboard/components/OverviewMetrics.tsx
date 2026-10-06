'use client';

import React from 'react';
import {
  Inbox,
  AlertCircle,
  Clock,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { Stagger } from '../../ui/motion';

interface OverviewMetricsProps {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  pendingLabel?: string;
  inProgressLabel?: string;
  resolvedLabel?: string;
  resolvedHint?: string;
  winRate?: number | null;
  wonLeads?: number | null;
  lostLeads?: number | null;
}

function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const rounded = Number(value.toFixed(digits));
  return `${rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(digits)}%`;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  totalCount,
  pendingCount,
  inProgressCount,
  resolvedCount,
  pendingLabel = 'Pending Review',
  inProgressLabel = 'In Progress',
  resolvedLabel = 'Resolved',
  resolvedHint = 'Final pipeline stage — still on the board, not archived',
  winRate = null,
  wonLeads = null,
  lostLeads = null,
}) => {
  const closed = (wonLeads ?? 0) + (lostLeads ?? 0);
  const winHint =
    closed > 0
      ? `${wonLeads ?? 0} won · ${lostLeads ?? 0} lost`
      : 'Share of closed inquiries that were won';

  return (
    <Stagger className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-5">
      <MetricCard
        label="Total Inquiries"
        hint="Active inquiries only — archived ones are hidden"
        icon={Inbox}
        iconColor="#E02126"
        iconBgColor="#FEE2E2"
        iconBorderColor="#FECACA"
        value={totalCount}
      />

      <MetricCard
        label={pendingLabel}
        icon={AlertCircle}
        iconColor="#B45309"
        iconBgColor="#FEF3C7"
        iconBorderColor="#FDE68A"
        value={pendingCount}
      />

      <MetricCard
        label={inProgressLabel}
        icon={Clock}
        iconColor="#57534E"
        iconBgColor="#F5F5F4"
        iconBorderColor="#E7E5E4"
        value={inProgressCount}
      />

      <MetricCard
        label={resolvedLabel}
        hint={resolvedHint}
        icon={CheckCircle2}
        iconColor="#15803D"
        iconBgColor="#DCFCE7"
        iconBorderColor="#BBF7D0"
        value={resolvedCount}
      />

      <MetricCard
        className="col-span-2 xl:col-span-1"
        label="Win rate"
        hint={winHint}
        icon={Target}
        iconColor="#1C1917"
        iconBgColor="#F5F5F4"
        iconBorderColor="#E7E5E4"
        value={formatPercent(winRate)}
      />
    </Stagger>
  );
};
