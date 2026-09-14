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
  momGrowth,
  winRate,
}) => {
  const growthText = 
    momGrowth !== null && momGrowth !== undefined 
      ? `${momGrowth >= 0 ? '+' : ''}${momGrowth}% MoM`
      : '+0% MoM';

  const growthStyle = 
    momGrowth !== null && momGrowth !== undefined && momGrowth < 0
      ? 'text-rose-400'
      : 'text-emerald-400';

  const winRateText = 
    winRate !== null && winRate !== undefined
      ? `${winRate}% Win Rate`
      : `${totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}% success`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Requests */}
      <MetricCard
        label="Total Inquiries"
        icon={Inbox}
        iconContainerStyle="bg-sky-500/10 text-sky-400 border border-sky-500/20"
        value={totalCount}
        badgeText={growthText}
        badgeStyle={growthStyle}
        subtext="From company website forms"
      />

      {/* Pending Triage */}
      <MetricCard
        label="Pending Review"
        icon={AlertCircle}
        iconContainerStyle="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        value={pendingCount}
        badgeText="Action Required"
        badgeStyle="text-amber-400"
        subtext="Awaiting advisor triage"
      />

      {/* In Progress */}
      <MetricCard
        label="In Progress"
        icon={Clock}
        iconContainerStyle="bg-sky-500/10 text-sky-400 border border-sky-500/20"
        value={inProgressCount}
        badgeText="Assigned"
        badgeStyle="text-sky-400"
        subtext="Under active engagement"
      />

      {/* Resolved */}
      <MetricCard
        label="Resolved Rate"
        icon={CheckCircle2}
        iconContainerStyle="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        value={resolvedCount}
        badgeText={winRateText}
        badgeStyle="text-emerald-400"
        subtext="Completed inquiries"
      />
    </div>
  );
};
