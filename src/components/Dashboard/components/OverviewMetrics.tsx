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
  const isNegativeGrowth = momGrowth !== null && momGrowth !== undefined && momGrowth < 0;
  const growthText = 
    momGrowth !== null && momGrowth !== undefined 
      ? `${momGrowth >= 0 ? '+' : ''}${momGrowth}% MoM`
      : '+0% MoM';

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
        iconColor="#38bdf8"
        iconBgColor="#38bdf826"
        iconBorderColor="#38bdf84d"
        value={totalCount}
        badgeText={growthText}
        badgeTextColor={isNegativeGrowth ? '#fca5a5' : '#6ee7b7'}
        badgeBgColor={isNegativeGrowth ? '#f43f5e33' : '#10b98133'}
        badgeBorderColor={isNegativeGrowth ? '#fb71854d' : '#34d3994d'}
        subtext="From company website forms"
      />

      {/* Pending Triage */}
      <MetricCard
        label="Pending Review"
        icon={AlertCircle}
        iconColor="#fbbf24"
        iconBgColor="#f59e0b26"
        iconBorderColor="#f59e0b4d"
        value={pendingCount}
        badgeText="Action Required"
        badgeTextColor="#fcd34d"
        badgeBgColor="#f59e0b33"
        badgeBorderColor="#fbbf244d"
        subtext="Awaiting advisor triage"
      />

      {/* In Progress */}
      <MetricCard
        label="In Progress"
        icon={Clock}
        iconColor="#60a5fa"
        iconBgColor="#3b82f626"
        iconBorderColor="#3b82f64d"
        value={inProgressCount}
        badgeText="Assigned"
        badgeTextColor="#93c5fd"
        badgeBgColor="#3b82f633"
        badgeBorderColor="#60a5fa4d"
        subtext="Under active engagement"
      />

      {/* Resolved */}
      <MetricCard
        label="Resolved Rate"
        icon={CheckCircle2}
        iconColor="#34d399"
        iconBgColor="#10b98126"
        iconBorderColor="#10b9814d"
        value={resolvedCount}
        badgeText={winRateText}
        badgeTextColor="#6ee7b7"
        badgeBgColor="#10b98133"
        badgeBorderColor="#34d3994d"
        subtext="Completed inquiries"
      />
    </div>
  );
};
