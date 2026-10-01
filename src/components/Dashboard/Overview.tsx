'use client';

import React from 'react';
import { 
  ServiceRequest, 
  OverviewKpi,
  MonthlyTrendsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse
} from '../../types';
import { MessagesGraph } from './MessagesGraph';
import { OverviewMetrics } from './components/OverviewMetrics';
import { RecentInquiries } from './components/RecentInquiries';
import { DemandBreakdown } from './components/DemandBreakdown';
import {
  MetricsSkeleton,
  ChartSkeleton,
  RecentInquiriesSkeleton,
  DemandSkeleton,
  LoadingOverlay,
} from '../ui/loading';

interface DashboardOverviewProps {
  requests: ServiceRequest[];
  overviewKpi?: OverviewKpi | null;
  monthlyTrends?: MonthlyTrendsResponse | null;
  serviceAnalytics?: ServiceAnalyticsResponse | null;
  funnelAnalytics?: FunnelAnalyticsResponse | null;
  isInitialLoading?: boolean;
  isRefreshing?: boolean;
  onNavigateToRequests: () => void;
  onSelectRequest: (req: ServiceRequest) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  requests,
  overviewKpi,
  monthlyTrends,
  serviceAnalytics,
  funnelAnalytics,
  isInitialLoading = false,
  isRefreshing = false,
  onNavigateToRequests,
  onSelectRequest,
}) => {
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isInitialLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <MetricsSkeleton />
        <ChartSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentInquiriesSkeleton />
          <DemandSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <LoadingOverlay visible={isRefreshing} label="Refreshing dashboard…" />

      <OverviewMetrics
        totalCount={overviewKpi?.totalLeads ?? requests.length}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
        momGrowth={overviewKpi?.momGrowthPercentage}
        winRate={overviewKpi?.winRatePercentage}
      />

      <MessagesGraph
        monthlyTrends={monthlyTrends}
        serviceAnalytics={serviceAnalytics}
        funnelAnalytics={funnelAnalytics}
        overviewKpi={overviewKpi}
        isLoading={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentInquiries
          recentRequests={recentRequests}
          onNavigateToRequests={onNavigateToRequests}
          onSelectRequest={onSelectRequest}
        />

        <DemandBreakdown
          services={serviceAnalytics?.services}
          isLoading={false}
        />
      </div>
    </div>
  );
};
