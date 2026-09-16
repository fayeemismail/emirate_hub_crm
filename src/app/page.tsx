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
import { SanityPortalFooter } from '../sanity/components/SanityPortalFooter';
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
    dashboardConfig,
    siteSettings,
    footer,
    themeSettings,
    services,
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

  // Derived counts
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return <AuthLoadingScreen />;
  }

  // Dynamic titles and subtitles derived from incoming Sanity data if present
  const headerTitle = activeTab === 'dashboard'
    ? (dashboardConfig?.dashboardTabTitle || 'Emirate Hub Executive Dashboard')
    : (dashboardConfig?.inquiriesTabTitle || 'Client Service Inquiries');

  const headerSubtitle = activeTab === 'dashboard'
    ? (dashboardConfig?.dashboardTabSubtitle || 'Overview of business consultancy inquiries & message metrics')
    : (dashboardConfig?.inquiriesTabSubtitle || 'User messages submitted from company website with Jira drag and drop');

  return (
    <div 
      className="min-h-screen flex font-sans antialiased selection:bg-[#2563eb] selection:text-white"
      style={{ 
        background: 'linear-gradient(180deg, #081d39 0%, #0b2548 40%, #061326 100%)',
        color: '#f8fafc' 
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
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            if (activeTab !== 'requests') {
              setActiveTab('requests');
            }
          }}
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          unreadCount={pendingCount}
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
              dashboardConfig={dashboardConfig}
              services={services}
              onNavigateToRequests={() => setActiveTab('requests')}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
              onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
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
              onUpdatePriority={handleUpdatePriority}
              onDeleteRequest={handleDeleteRequest}
            />
          )}
        </main>

        {/* Sanity-driven Portal Footer */}
        <SanityPortalFooter footer={footer} />
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
