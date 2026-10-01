'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useActiveTab } from '../hooks/useActiveTab';
import { useDashboardData } from '../hooks/useDashboardData';
import { useSanityData } from '../sanity';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardOverview } from '../components/Dashboard/Overview';
import { ServiceRequestsView } from '../components/ServiceRequests/ServiceRequestsView';
import { RequestDetailModal } from '../components/ServiceRequests/RequestDetailModal';
import { SimulateFormModal } from '../components/ServiceRequests/SimulateFormModal';
import { AuthLoadingScreen } from '../components/AuthLoadingScreen';
import { SanityThemeStyle } from '../sanity/components/SanityThemeStyle';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeTab, setActiveTab } = useActiveTab('dashboard');

  // UI state for modals, drawers, and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestModal, setSelectedRequestModal] = useState<ServiceRequest | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Sanity CMS integration layer (data fetching & strict validation)
  const {
    siteSettings,
    themeSettings,
  } = useSanityData();

  // Leads & Analytics data layer
  const {
    requests,
    overviewKpi,
    monthlyTrends,
    serviceAnalytics,
    funnelAnalytics,
    isDataLoading,
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

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Set browser tab title dynamically from Sanity siteSettings
  useEffect(() => {
    if (siteSettings?.siteTitle) {
      document.title = `${siteSettings.siteTitle} • Business Consultancy CRM`;
    }
  }, [siteSettings?.siteTitle]);

  // Derived counts
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return <AuthLoadingScreen />;
  }

  return (
    <div 
      className="min-h-screen flex font-sans antialiased selection:bg-[#E02126] selection:text-white"
      style={{ 
        backgroundColor: 'var(--sanity-bg-main, #F7F5F1)',
        background: 'var(--sanity-page-bg, #F7F5F1)',
        color: 'var(--sanity-text-primary, #1C1917)' 
      }}
    >
      {/* Live Sanity Dynamic Theme Injector */}
      <SanityThemeStyle themeSettings={themeSettings} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
        siteSettings={siteSettings}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <Header
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          onCreateLead={() => setIsSimulateModalOpen(true)}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              requests={requests}
              overviewKpi={overviewKpi}
              monthlyTrends={monthlyTrends}
              serviceAnalytics={serviceAnalytics}
              funnelAnalytics={funnelAnalytics}
              isLoadingAnalytics={isDataLoading}
              onNavigateToRequests={() => setActiveTab('requests')}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
            />
          )}

          {activeTab === 'requests' && (
            <ServiceRequestsView
              requests={requests}
              isLoading={isDataLoading}
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

      {/* Request Details Drawer / Modal */}
      <RequestDetailModal
        request={selectedRequestModal}
        onClose={() => setSelectedRequestModal(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
        onDeleteRequest={handleDeleteRequest}
        onAddNote={handleAddNote}
      />

      {/* Website Contact Form Simulator Modal */}
      <SimulateFormModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onSubmitNewRequest={handleSubmitNewRequest}
      />
    </div>
  );
}
