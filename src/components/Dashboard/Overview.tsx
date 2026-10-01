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

interface DashboardOverviewProps {
  requests: ServiceRequest[];
  overviewKpi?: OverviewKpi | null;
  monthlyTrends?: MonthlyTrendsResponse | null;
  serviceAnalytics?: ServiceAnalyticsResponse | null;
  funnelAnalytics?: FunnelAnalyticsResponse | null;
  isLoadingAnalytics?: boolean;
  onNavigateToRequests: () => void;
  onSelectRequest: (req: ServiceRequest) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  requests,
  overviewKpi,
  monthlyTrends,
  serviceAnalytics,
  funnelAnalytics,
  isLoadingAnalytics = false,
  onNavigateToRequests,
  onSelectRequest,
}) => {
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  const recentRequests = requests.slice(0, 4);

  return (
    <div className="space-y-6">
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
        isLoading={isLoadingAnalytics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentInquiries
          recentRequests={recentRequests}
          onNavigateToRequests={onNavigateToRequests}
          onSelectRequest={onSelectRequest}
        />

        <DemandBreakdown
          services={serviceAnalytics?.services}
          isLoading={isLoadingAnalytics}
        />
      </div>
    </div>
  );
};
