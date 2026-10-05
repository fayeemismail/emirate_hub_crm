'use client';

import React, { useMemo } from 'react';
import {
  ServiceRequest,
  PipelineStatus,
  OverviewKpi,
  MonthlyTrendsResponse,
  AvailableYearsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse,
} from '../../types';
import { MessagesGraph } from './MessagesGraph';
import { OverviewMetrics } from './components/OverviewMetrics';
import { RecentInquiries } from './components/RecentInquiries';
import { DemandBreakdown } from './components/DemandBreakdown';
import { DashboardSkeleton } from '../ui/loading';
import { getRecentInquiries } from '../../lib/adapters';

interface DashboardOverviewProps {
  requests: ServiceRequest[];
  pipelineStatuses?: PipelineStatus[];
  defaultStatusSlug?: string;
  overviewKpi?: OverviewKpi | null;
  monthlyTrends?: MonthlyTrendsResponse | null;
  availableYears?: AvailableYearsResponse | null;
  serviceAnalytics?: ServiceAnalyticsResponse | null;
  funnelAnalytics?: FunnelAnalyticsResponse | null;
  isInitialLoading?: boolean;
  isRefreshing?: boolean;
  onNavigateToRequests: () => void;
  onSelectRequest: (req: ServiceRequest) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  requests,
  pipelineStatuses = [],
  defaultStatusSlug = '',
  overviewKpi,
  monthlyTrends,
  availableYears,
  serviceAnalytics,
  funnelAnalytics,
  isInitialLoading = false,
  isRefreshing = false,
  onNavigateToRequests,
  onSelectRequest,
}) => {
  const ordered = useMemo(
    () => [...pipelineStatuses].sort((a, b) => a.order - b.order),
    [pipelineStatuses]
  );
  const firstSlug =
    defaultStatusSlug || ordered.find((s) => s.isDefault)?.slug || ordered[0]?.slug;
  const lastSlug = ordered[ordered.length - 1]?.slug;
  const middleSlugs = useMemo(
    () =>
      new Set(
        ordered
          .map((s) => s.slug)
          .filter((slug) => slug !== firstSlug && slug !== lastSlug)
      ),
    [ordered, firstSlug, lastSlug]
  );

  const pendingCount = firstSlug
    ? requests.filter((r) => r.status === firstSlug).length
    : 0;
  const inProgressCount = requests.filter((r) => middleSlugs.has(r.status)).length;
  const resolvedCount = lastSlug
    ? requests.filter((r) => r.status === lastSlug).length
    : 0;

  const recentRequests = useMemo(
    () => getRecentInquiries(requests, 5),
    [requests]
  );

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative space-y-6">
      <OverviewMetrics
        totalCount={overviewKpi?.activeLeads ?? requests.length}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
        pendingLabel={
          ordered.find((s) => s.slug === firstSlug)?.title || 'Pending Review'
        }
        inProgressLabel="In Progress"
        resolvedLabel={
          ordered.find((s) => s.slug === lastSlug)?.title || 'Resolved'
        }
        resolvedHint="Final pipeline stage — still on the board, not archived"
        winRate={overviewKpi?.winRatePercentage}
        wonLeads={overviewKpi?.wonLeads}
        lostLeads={overviewKpi?.lostLeads}
      />

      <MessagesGraph
        monthlyTrends={monthlyTrends}
        availableYears={availableYears}
        serviceAnalytics={serviceAnalytics}
        funnelAnalytics={funnelAnalytics}
        overviewKpi={overviewKpi}
        isLoading={false}
        isRefreshing={isRefreshing}
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
