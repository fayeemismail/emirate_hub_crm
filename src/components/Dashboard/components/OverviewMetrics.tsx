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
      ? 'text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-400/30'
      : 'text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30';

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
        iconContainerStyle="bg-blue-500/20 text-sky-300 border border-blue-400/30 shadow-sm"
        value={totalCount}
        badgeText={growthText}
        badgeStyle={growthStyle}
        subtext="From company website forms"
      />

      {/* Pending Triage */}
      <MetricCard
        label="Pending Review"
        icon={AlertCircle}
        iconContainerStyle="bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm"
        value={pendingCount}
        badgeText="Action Required"
        badgeStyle="text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30"
        subtext="Awaiting advisor triage"
      />

      {/* In Progress */}
      <MetricCard
        label="In Progress"
        icon={Clock}
        iconContainerStyle="bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm"
        value={inProgressCount}
        badgeText="Assigned"
        badgeStyle="text-sky-200 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-400/30"
        subtext="Under active engagement"
      />

      {/* Resolved */}
      <MetricCard
        label="Resolved Rate"
        icon={CheckCircle2}
        iconContainerStyle="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-sm"
        value={resolvedCount}
        badgeText={winRateText}
        badgeStyle="text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30"
        subtext="Completed inquiries"
      />
    </div>
  );
};
