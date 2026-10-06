'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useActiveTab } from '../hooks/useActiveTab';
import {
  useDashboardData,
  DEFAULT_INQUIRY_LIST_QUERY,
  type InquiryListQuery,
} from '../hooks/useDashboardData';
import { useCrmSettings } from '../hooks/useCrmSettings';
import { getOrphanRequests } from '../lib/orphans';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { DashboardOverview } from '../components/Dashboard/Overview';
import {
  ServiceRequestsView,
  getInitialInquiriesViewMode,
  type InquiryFiltersState,
} from '../components/ServiceRequests/ServiceRequestsView';
import { OrphanRequestsView } from '../components/ServiceRequests/OrphanRequestsView';
import { ArchivesView } from '../components/ServiceRequests/ArchivesView';
import { SettingsView } from '../components/SettingsView';
import { RequestDetailModal } from '../components/ServiceRequests/RequestDetailModal';
import { SimulateFormModal } from '../components/ServiceRequests/SimulateFormModal';
import { AuthLoadingScreen } from '../components/AuthLoadingScreen';
import { PageEnter } from '../components/ui/motion';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeTab, setActiveTab } = useActiveTab('dashboard');
  const { tableSort } = useCrmSettings();

  const [inquiryFilters, setInquiryFilters] = useState<InquiryFiltersState>(() => ({
    search: '',
    service: 'All',
    status: 'All',
    tableSort,
    viewMode: typeof window !== 'undefined' ? getInitialInquiriesViewMode() : 'kanban',
  }));

  // Sync persisted table sort into inquiry query when settings hydrate/change.
  useEffect(() => {
    setInquiryFilters((prev) =>
      prev.tableSort === tableSort ? prev : { ...prev, tableSort }
    );
  }, [tableSort]);

  const onInquiryFiltersChange = useCallback((patch: Partial<InquiryFiltersState>) => {
    setInquiryFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  // Dashboard / orphans / settings: all-time leads + analytics (no lookback).
  // Requests tab: BE filters including Settings lookback (Service Inquiries only).
  const inquiryQuery: InquiryListQuery = useMemo(() => {
    if (activeTab !== 'requests') {
      return DEFAULT_INQUIRY_LIST_QUERY;
    }
    return {
      search: inquiryFilters.search,
      service: inquiryFilters.service,
      status: inquiryFilters.status,
      tableSort: inquiryFilters.tableSort,
      viewMode: inquiryFilters.viewMode,
      applyLookback: true,
    };
  }, [activeTab, inquiryFilters]);

  const [selectedRequestModal, setSelectedRequestModal] = useState<ServiceRequest | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [archivesRefreshKey, setArchivesRefreshKey] = useState(0);

  const {
    requests,
    leadsTotal,
    pipelineStatuses,
    catalogServices,
    defaultStatusSlug,
    overviewKpi,
    monthlyTrends,
    availableYears,
    serviceAnalytics,
    funnelAnalytics,
    navPendingCount,
    isInitialLoading,
    isRefreshing,
    isInquiryListLoading,
    loadBackendData,
    handleUpdateStatus,
    handleKanbanSync,
    handleUpdatePriority,
    handleDeleteRequest,
    handleRestoreRequest,
    handleAddNote,
    handleSubmitNewRequest,
  } = useDashboardData({
    isAuthenticated,
    inquiryQuery,
    onModalRequestUpdate: (updater) => setSelectedRequestModal((prev) => updater(prev)),
  });

  const onRestoreRequest = useCallback(
    async (id: string) => {
      await handleRestoreRequest(id);
      setArchivesRefreshKey((k) => k + 1);
    },
    [handleRestoreRequest]
  );

  const onArchiveRequest = useCallback(
    async (id: string) => {
      await handleDeleteRequest(id);
      setArchivesRefreshKey((k) => k + 1);
    },
    [handleDeleteRequest]
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const orphanCount = useMemo(
    () => getOrphanRequests(requests, pipelineStatuses).length,
    [requests, pipelineStatuses]
  );

  useEffect(() => {
    if (activeTab !== 'off-pipeline' || orphanCount > 0 || isInitialLoading) {
      return;
    }
    // Let success feedback show before leaving the empty off-pipeline page.
    const t = window.setTimeout(() => setActiveTab('requests'), 2200);
    return () => window.clearTimeout(t);
  }, [activeTab, orphanCount, isInitialLoading, setActiveTab]);

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return <AuthLoadingScreen />;
  }

  return (
    <div
      className="min-h-screen flex font-sans antialiased"
      style={{
        backgroundColor: 'var(--crm-bg-main, #F7F5F1)',
        background: 'var(--crm-page-bg, #F7F5F1)',
        color: 'var(--crm-text-primary, #1C1917)',
      }}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={navPendingCount}
        orphanCount={orphanCount}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          onCreateLead={() => setIsSimulateModalOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 p-3 pb-24 sm:p-6 sm:pb-6 lg:p-8">
          <PageEnter resetKey={activeTab} className="space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              requests={requests}
              pipelineStatuses={pipelineStatuses}
              defaultStatusSlug={defaultStatusSlug}
              overviewKpi={overviewKpi}
              monthlyTrends={monthlyTrends}
              availableYears={availableYears}
              serviceAnalytics={serviceAnalytics}
              funnelAnalytics={funnelAnalytics}
              isInitialLoading={isInitialLoading}
              isRefreshing={isRefreshing}
              onNavigateToRequests={() => setActiveTab('requests')}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
            />
          )}

          {activeTab === 'requests' && (
            <ServiceRequestsView
              requests={requests}
              leadsTotal={leadsTotal}
              pipelineStatuses={pipelineStatuses}
              catalogServices={catalogServices}
              isLoading={isInitialLoading || isInquiryListLoading}
              isRefreshing={isRefreshing && !isInquiryListLoading}
              filters={inquiryFilters}
              onFiltersChange={onInquiryFiltersChange}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
              onUpdateStatus={handleUpdateStatus}
              onKanbanSync={handleKanbanSync}
              onDeleteRequest={onArchiveRequest}
            />
          )}

          {activeTab === 'off-pipeline' && (
            <OrphanRequestsView
              requests={requests}
              pipelineStatuses={pipelineStatuses}
              defaultStatusSlug={defaultStatusSlug}
              isLoading={isInitialLoading}
              isRefreshing={isRefreshing}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'archives' && (
            <ArchivesView
              pipelineStatuses={pipelineStatuses}
              refreshKey={archivesRefreshKey}
              onRestored={async () => {
                await loadBackendData();
              }}
              onSelectRequest={(req) =>
                setSelectedRequestModal({ ...req, isDeleted: true })
              }
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
          </PageEnter>
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={navPendingCount}
        onCreateLead={() => setIsSimulateModalOpen(true)}
        onOpenMenu={() => setIsOpenMobileSidebar(true)}
      />

      <RequestDetailModal
        request={selectedRequestModal}
        pipelineStatuses={pipelineStatuses}
        archivedView={activeTab === 'archives'}
        onClose={() => setSelectedRequestModal(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
        onDeleteRequest={onArchiveRequest}
        onRestoreRequest={onRestoreRequest}
        onAddNote={handleAddNote}
      />

      <SimulateFormModal
        isOpen={isSimulateModalOpen}
        catalogServices={catalogServices}
        onClose={() => setIsSimulateModalOpen(false)}
        onSubmitNewRequest={handleSubmitNewRequest}
      />
    </div>
  );
}
