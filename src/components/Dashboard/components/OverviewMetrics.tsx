'use client';

import React from 'react';
import { Inbox, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface OverviewMetricsProps {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  pendingLabel?: string;
  inProgressLabel?: string;
  resolvedLabel?: string;
  resolvedHint?: string;
  momGrowth?: number | null;
  winRate?: number | null;
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
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
};
