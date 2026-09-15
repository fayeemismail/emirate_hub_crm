'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ServiceRequest, 
  RequestStatus, 
  RequestPriority, 
  OverviewKpi,
  MonthlyTrendsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse 
} from '../types';
import { INITIAL_SERVICE_REQUESTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { leadsApi, analyticsApi } from '../lib/api';
import { leadToServiceRequest, requestStatusToBackendSlug, sortByPriorityDesc, requestPriorityToBackendEnum } from '../lib/adapters';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardOverview } from '../components/Dashboard/Overview';
import { ServiceRequestsView } from '../components/ServiceRequests/ServiceRequestsView';
import { RequestDetailModal } from '../components/ServiceRequests/RequestDetailModal';
import { SimulateFormModal } from '../components/ServiceRequests/SimulateFormModal';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests'>('dashboard');

  // Synchronize active tab with URL query parameter (?tab=...) and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validTabs = ['dashboard', 'requests'] as const;
    type ValidTab = typeof validTabs[number];

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ValidTab | null;
    const storedTab = (localStorage.getItem('emirate_active_tab') || localStorage.getItem('foundex_active_tab')) as ValidTab | null;

    let targetTab: ValidTab = 'dashboard';
    if (tabParam && validTabs.includes(tabParam)) {
      targetTab = tabParam;
    } else if (storedTab && validTabs.includes(storedTab)) {
      targetTab = storedTab;
    }

    setActiveTab(targetTab);

    try {
      localStorage.setItem('emirate_active_tab', targetTab);
      const url = new URL(window.location.href);
      if (targetTab !== 'dashboard') {
        url.searchParams.set('tab', targetTab);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  }, []);

  // Listen to browser navigation (back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const validTabs = ['dashboard', 'requests'] as const;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as any;
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
        localStorage.setItem('emirate_active_tab', tabParam);
      } else {
        setActiveTab('dashboard');
        localStorage.setItem('emirate_active_tab', 'dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handler for changing tabs with URL and localStorage sync
  const handleTabChange = useCallback((tab: 'dashboard' | 'requests') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('emirate_active_tab', tab);
        const url = new URL(window.location.href);
        if (tab !== 'dashboard') {
          url.searchParams.set('tab', tab);
        } else {
          url.searchParams.delete('tab');
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore
      }
    }
  }, []);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [overviewKpi, setOverviewKpi] = useState<OverviewKpi | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendsResponse | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalyticsResponse | null>(null);
  const [funnelAnalytics, setFunnelAnalytics] = useState<FunnelAnalyticsResponse | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestModal, setSelectedRequestModal] = useState<ServiceRequest | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch real leads and analytics from backend when authenticated
  const loadBackendData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsDataLoading(true);
    try {
      const [leadsRes, overviewRes, trendsRes, servicesRes, funnelRes] = await Promise.allSettled([
        leadsApi.getAdminLeads({ limit: 100 }),
        analyticsApi.getOverview(),
        analyticsApi.getMonthlyTrends({ year: new Date().getFullYear() }),
        analyticsApi.getServiceAnalytics(),
        analyticsApi.getFunnelAnalytics(),
      ]);

      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data) {
        // Only show real data, filter out soft-deleted leads
        const rawList = Array.isArray(leadsRes.value.data) ? leadsRes.value.data : [];
        const mapped = rawList
          .filter((l: any) => !l.isDeleted)
          .map(leadToServiceRequest)
          .sort(sortByPriorityDesc);
        setRequests(mapped);
      } else {
        setRequests([]);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setOverviewKpi(overviewRes.value.data);
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value?.data) {
        setMonthlyTrends(trendsRes.value.data);
      }
      if (servicesRes.status === 'fulfilled' && servicesRes.value?.data) {
        setServiceAnalytics(servicesRes.value.data);
      }
      if (funnelRes.status === 'fulfilled' && funnelRes.value?.data) {
        setFunnelAnalytics(funnelRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load live backend data:', err);
      setRequests([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBackendData();
    }
  }, [isAuthenticated, loadBackendData]);

  // Counters
  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  // Handle request status change with live backend sync
  const handleUpdateStatus = async (id: string, newStatus: RequestStatus) => {
    // Optimistic UI update
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated = { ...req, status: newStatus };
        if (selectedRequestModal?.id === id) {
          setSelectedRequestModal(updated);
        }
        return updated;
      }
      return req;
    }));

    // Persist to backend only if it is a valid MongoDB ObjectId
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) {
      return;
    }

    try {
      const backendSlug = requestStatusToBackendSlug(newStatus);
      await leadsApi.updateLeadStatus(id, backendSlug, 0, `Status moved to ${newStatus}`);
      loadBackendData();
    } catch (err: any) {
      console.warn(`Could not sync status to backend for lead ${id}:`, err?.message || err);
    }
  };

  // Handle admin changing priority with live backend sync and priority re-sort
  const handleUpdatePriority = async (id: string, newPriority: RequestPriority) => {
    // Optimistically update priority and maintain high-priority-on-top sorting
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === id) {
          return { ...req, priority: newPriority };
        }
        return req;
      });
      return updated.sort(sortByPriorityDesc);
    });

    if (selectedRequestModal?.id === id) {
      setSelectedRequestModal(prev => prev ? { ...prev, priority: newPriority } : null);
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) return;

    try {
      const backendPriority = requestPriorityToBackendEnum(newPriority);
      await leadsApi.updateLeadDetails(id, { priority: backendPriority });
      loadBackendData();
    } catch (err: any) {
      console.warn(`Could not sync priority to backend for lead ${id}:`, err?.message || err);
    }
  };

  // Handle soft delete with live backend sync (never show soft deleted data)
  const handleDeleteRequest = async (id: string) => {
    // Optimistically remove from visible list
    setRequests(prev => prev.filter(req => req.id !== id));

    if (selectedRequestModal?.id === id) {
      setSelectedRequestModal(null);
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) return;

    try {
      await leadsApi.deleteLead(id);
      loadBackendData();
    } catch (err: any) {
      console.warn(`Could not soft delete lead ${id} on backend:`, err?.message || err);
    }
  };

  // Handle adding internal note with live backend sync
  const handleAddNote = async (id: string, noteText: string) => {
    // Optimistic UI update
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updatedNotes = [...(req.notes || []), noteText];
        const updated = { ...req, notes: updatedNotes };
        if (selectedRequestModal?.id === id) {
          setSelectedRequestModal(updated);
        }
        return updated;
      }
      return req;
    }));

    // Persist to backend lead details only if it is a valid MongoDB ObjectId
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) {
      return;
    }

    try {
      await leadsApi.updateLeadDetails(id, { message: noteText });
    } catch (err: any) {
      console.warn(`Could not sync note to backend for lead ${id}:`, err?.message || err);
    }
  };

  // Handle new submission simulated from website form with live backend ingestion
  const handleSubmitNewRequest = async (newReqData: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'priority'>) => {
    try {
      const clientFullName = newReqData.name || `${newReqData.firstName} ${newReqData.lastName}`.trim();
      // Send to public lead ingestion endpoint
      const res = await leadsApi.createPublicLead({
        name: clientFullName,
        firstName: newReqData.firstName,
        lastName: newReqData.lastName,
        email: newReqData.email,
        phone: newReqData.phone,
        service: newReqData.service,
        message: newReqData.message,
        formData: {
          companyName: newReqData.companyName,
          source: 'Website Form Simulator',
        },
      });

      if (res.data) {
        const mappedNewLead = leadToServiceRequest(res.data);
        setRequests(prev => [mappedNewLead, ...prev].sort(sortByPriorityDesc));
        // Refresh leads from backend to ensure complete metadata and valid ObjectId
        loadBackendData();
      } else {
        // Fallback optimistic addition
        const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
        const newRequest: ServiceRequest = {
          ...newReqData,
          name: clientFullName,
          id: newId,
          createdAt: new Date().toISOString(),
          status: 'Pending',
          priority: 'High',
          notes: ['Submitted via website form simulator.'],
          isDeleted: false,
        };
        setRequests(prev => [newRequest, ...prev].sort(sortByPriorityDesc));
      }
    } catch (err) {
      console.warn('Backend submission failed, saving locally:', err);
      const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
      const clientFullName = newReqData.name || `${newReqData.firstName} ${newReqData.lastName}`.trim();
      const newRequest: ServiceRequest = {
        ...newReqData,
        name: clientFullName,
        id: newId,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        priority: 'High',
        notes: ['Submitted via website form simulator.'],
        isDeleted: false,
      };
      setRequests(prev => [newRequest, ...prev].sort(sortByPriorityDesc));
    }

    // Refresh live backend analytics and graphs
    loadBackendData();
  };

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen office-blue-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sky-200">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Authenticating Emirate Hub session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen office-blue-bg text-slate-100 flex font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        pendingCount={pendingCount}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <Header
          title={
            activeTab === 'dashboard' ? 'Emirate Hub Executive Dashboard' : 'Client Service Inquiries'
          }
          subtitle={
            activeTab === 'dashboard'
              ? 'Overview of business consultancy inquiries & message metrics'
              : 'User messages submitted from company website with Jira drag and drop'
          }
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            if (activeTab !== 'requests') {
              handleTabChange('requests');
            }
          }}
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          unreadCount={pendingCount}
          isOfficeBlue={true}
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
              onNavigateToRequests={() => handleTabChange('requests')}
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

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-blue-400/20 text-center text-xs font-medium text-sky-200/70 bg-[#061426]/80">
          Emirate Hub Business Consultancy Admin Portal • Executive Office Blue Theme
        </footer>
      </div>

      {/* Request Details Drawer/Modal */}
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
