'use client';

import React from 'react';
import { ServiceRequest, MessagesGraphData } from '../../types';
import { MessagesGraph } from './MessagesGraph';
import { PortalBanner } from './components/PortalBanner';
import { OverviewMetrics } from './components/OverviewMetrics';
import { RecentInquiries } from './components/RecentInquiries';
import { DemandBreakdown } from './components/DemandBreakdown';

interface DashboardOverviewProps {
  requests: ServiceRequest[];
  graphData: MessagesGraphData[];
  onNavigateToRequests: () => void;
  onSelectRequest: (req: ServiceRequest) => void;
  onOpenSimulateModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  requests,
  graphData,
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
      {/* Top Banner Notice */}
      <PortalBanner onOpenSimulateModal={onOpenSimulateModal} />

      {/* Metrics Row */}
      <OverviewMetrics
        totalCount={requests.length}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
      />

      {/* Featured Chart: All Messages Graph */}
      <MessagesGraph data={graphData} />

      {/* Bottom Grid: Recent Activity & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Service Requests Column */}
        <RecentInquiries
          recentRequests={recentRequests}
          onNavigateToRequests={onNavigateToRequests}
          onSelectRequest={onSelectRequest}
        />

        {/* Consultancy Services Breakdown */}
        <DemandBreakdown />
      </div>
    </div>
  );
};
