'use client';

import React from 'react';
import { Inbox, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface OverviewMetricsProps {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  momGrowth?: number | null;
  winRate?: number | null;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  totalCount,
  pendingCount,
  inProgressCount,
  resolvedCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Inquiries"
        icon={Inbox}
        iconColor="#E02126"
        iconBgColor="#FEE2E2"
        iconBorderColor="#FECACA"
        value={totalCount}
      />

      <MetricCard
        label="Pending Review"
        icon={AlertCircle}
        iconColor="#B45309"
        iconBgColor="#FEF3C7"
        iconBorderColor="#FDE68A"
        value={pendingCount}
      />

      <MetricCard
        label="In Progress"
        icon={Clock}
        iconColor="#57534E"
        iconBgColor="#F5F5F4"
        iconBorderColor="#E7E5E4"
        value={inProgressCount}
      />

      <MetricCard
        label="Resolved"
        icon={CheckCircle2}
        iconColor="#15803D"
        iconBgColor="#DCFCE7"
        iconBorderColor="#BBF7D0"
        value={resolvedCount}
      />
    </div>
  );
};
