'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useActiveTab } from '../hooks/useActiveTab';
import { useDashboardData } from '../hooks/useDashboardData';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardOverview } from '../components/Dashboard/Overview';
import { ServiceRequestsView } from '../components/ServiceRequests/ServiceRequestsView';
import { RequestDetailModal } from '../components/ServiceRequests/RequestDetailModal';
import { SimulateFormModal } from '../components/ServiceRequests/SimulateFormModal';
import { AuthLoadingScreen } from '../components/AuthLoadingScreen';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeTab, setActiveTab } = useActiveTab('dashboard');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestModal, setSelectedRequestModal] = useState<ServiceRequest | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  const {
    requests,
    overviewKpi,
    monthlyTrends,
    serviceAnalytics,
    funnelAnalytics,
    isInitialLoading,
    isRefreshing,
    handleUpdateStatus,
    handleKanbanSync,
    handleUpdatePriority,
    handleDeleteRequest,
    handleAddNote,
    handleSubmitNewRequest,
  } = useDashboardData({
    isAuthenticated,
    onModalRequestUpdate: (updater) => setSelectedRequestModal((prev) => updater(prev)),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return <AuthLoadingScreen />;
  }

  return (
    <div
      className="min-h-screen flex font-sans antialiased selection:bg-[#E02126] selection:text-white"
      style={{
        backgroundColor: 'var(--crm-bg-main, #F7F5F1)',
        background: 'var(--crm-page-bg, #F7F5F1)',
        color: 'var(--crm-text-primary, #1C1917)',
      }}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          onCreateLead={() => setIsSimulateModalOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              requests={requests}
              overviewKpi={overviewKpi}
              monthlyTrends={monthlyTrends}
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
              isLoading={isInitialLoading}
              isRefreshing={isRefreshing}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
              onUpdateStatus={handleUpdateStatus}
              onKanbanSync={handleKanbanSync}
              onDeleteRequest={handleDeleteRequest}
            />
          )}
        </main>
      </div>

      <RequestDetailModal
        request={selectedRequestModal}
        onClose={() => setSelectedRequestModal(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
        onDeleteRequest={handleDeleteRequest}
        onAddNote={handleAddNote}
      />

      <SimulateFormModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onSubmitNewRequest={handleSubmitNewRequest}
      />
    </div>
  );
}
