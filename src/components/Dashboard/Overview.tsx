'use client';

import React from 'react';
import { 
  ServiceRequest, 
  OverviewKpi,
  MonthlyTrendsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse
} from '../../types';
import { SanityDashboardConfig, SanityService } from '../../sanity';
import { MessagesGraph } from './MessagesGraph';
import { SanityPortalBanner } from '../../sanity/components/SanityPortalBanner';
import { SanityServicesShowcase } from '../../sanity/components/SanityServicesShowcase';
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
  dashboardConfig?: SanityDashboardConfig | null;
  services?: SanityService[] | null;
  onNavigateToRequests: () => void;
  onSelectRequest: (req: ServiceRequest) => void;
  onOpenSimulateModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  requests,
  overviewKpi,
  monthlyTrends,
  serviceAnalytics,
  funnelAnalytics,
  isLoadingAnalytics = false,
  dashboardConfig = null,
  services = null,
  onNavigateToRequests,
  onSelectRequest,
  onOpenSimulateModal,
}) => {
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  const recentRequests = requests.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Rendered from Sanity CMS if incoming, otherwise omitted */}
      <SanityPortalBanner
        dashboardConfig={dashboardConfig}
        onOpenSimulateModal={onOpenSimulateModal}
        showFallbackIfMissing={false}
      />

      {/* Metrics Row */}
      <OverviewMetrics
        totalCount={overviewKpi?.totalLeads ?? requests.length}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
        momGrowth={overviewKpi?.momGrowthPercentage}
        winRate={overviewKpi?.winRatePercentage}
      />

      {/* Featured Chart: Live Route-Driven Analytics */}
      <MessagesGraph
        monthlyTrends={monthlyTrends}
        serviceAnalytics={serviceAnalytics}
        funnelAnalytics={funnelAnalytics}
        overviewKpi={overviewKpi}
        isLoading={isLoadingAnalytics}
      />

      {/* Sanity Services Integration: Only displays when incoming data exists; shows fallback error message if no records found */}
      <SanityServicesShowcase
        services={services}
        showFallbackIfEmpty={true}
      />

      {/* Bottom Grid: Recent Activity & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Service Requests Column */}
        <RecentInquiries
          recentRequests={recentRequests}
          onNavigateToRequests={onNavigateToRequests}
          onSelectRequest={onSelectRequest}
        />

        {/* Consultancy Services Breakdown */}
        <DemandBreakdown
          services={serviceAnalytics?.services}
          isLoading={isLoadingAnalytics}
        />
      </div>
    </div>
  );
};
