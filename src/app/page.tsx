'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceRequest, RequestStatus, MessagesGraphData } from '../types';
import { INITIAL_SERVICE_REQUESTS, MESSAGES_GRAPH_TIMELINE } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { leadsApi, analyticsApi } from '../lib/api';
import { leadToServiceRequest, requestStatusToBackendSlug } from '../lib/adapters';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardOverview } from '../components/Dashboard/Overview';
import { ServiceRequestsView } from '../components/ServiceRequests/ServiceRequestsView';
import { RequestDetailModal } from '../components/ServiceRequests/RequestDetailModal';
import { SimulateFormModal } from '../components/ServiceRequests/SimulateFormModal';
import { ServicesCatalog } from '../components/ServicesCatalog';
import { SettingsView } from '../components/SettingsView';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'services' | 'settings'>('dashboard');
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_SERVICE_REQUESTS);
  const [graphData, setGraphData] = useState<MessagesGraphData[]>(MESSAGES_GRAPH_TIMELINE);
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
      const [leadsRes, analyticsRes] = await Promise.allSettled([
        leadsApi.getAdminLeads({ limit: 100 }),
        analyticsApi.getOverview(),
      ]);

      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data && leadsRes.value.data.length > 0) {
        const mapped = leadsRes.value.data.map(leadToServiceRequest);
        setRequests(mapped);
      }
    } catch (err) {
      console.error('Failed to load live backend data:', err);
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
      // Mock/local lead; status already updated in local state
      return;
    }

    try {
      const backendSlug = requestStatusToBackendSlug(newStatus);
      await leadsApi.updateLeadStatus(id, backendSlug, 0, `Status moved to ${newStatus}`);
    } catch (err: any) {
      console.warn(`Could not sync status to backend for lead ${id}:`, err?.message || err);
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
      // Send to public lead ingestion endpoint
      const res = await leadsApi.createPublicLead({
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
        setRequests(prev => [mappedNewLead, ...prev]);
        // Refresh leads from backend to ensure complete metadata and valid ObjectId
        loadBackendData();
      } else {
        // Fallback optimistic addition
        const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
        const newRequest: ServiceRequest = {
          ...newReqData,
          id: newId,
          createdAt: new Date().toISOString(),
          status: 'Pending',
          priority: 'High',
          notes: ['Submitted via website form simulator.'],
        };
        setRequests(prev => [newRequest, ...prev]);
      }
    } catch (err) {
      console.warn('Backend submission failed, saving locally:', err);
      const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
      const newRequest: ServiceRequest = {
        ...newReqData,
        id: newId,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        priority: 'High',
        notes: ['Submitted via website form simulator.'],
      };
      setRequests(prev => [newRequest, ...prev]);
    }

    // Dynamically update latest day's graph total
    setGraphData(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (lastIdx >= 0) {
        updated[lastIdx] = {
          ...updated[lastIdx],
          total: updated[lastIdx].total + 1,
          webDev: newReqData.service === 'Web Development' ? updated[lastIdx].webDev + 1 : updated[lastIdx].webDev,
          aiAutomation: newReqData.service === 'AI & Automation' ? updated[lastIdx].aiAutomation + 1 : updated[lastIdx].aiAutomation,
        };
      }
      return updated;
    });
  };

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Authenticating Foundex session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <Header
          title={
            activeTab === 'dashboard' ? 'Foundex Executive Dashboard' :
            activeTab === 'requests' ? 'Client Service Inquiries' :
            activeTab === 'services' ? 'Consultancy Offerings' : 'Settings'
          }
          subtitle={
            activeTab === 'dashboard' ? 'Overview of business consultancy inquiries & message metrics' :
            activeTab === 'requests' ? 'User messages submitted from company website with Jira drag and drop' :
            activeTab === 'services' ? 'Active consultancy services presented on website' :
            'Admin preferences'
          }
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            if (activeTab !== 'requests') {
              setActiveTab('requests');
            }
          }}
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
          unreadCount={pendingCount}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              requests={requests}
              graphData={graphData}
              onNavigateToRequests={() => setActiveTab('requests')}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
              onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
            />
          )}

          {activeTab === 'requests' && (
            <ServiceRequestsView
              requests={requests}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectRequest={(req) => setSelectedRequestModal(req)}
              onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'services' && (
            <ServicesCatalog />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-white/10 text-center text-xs text-slate-400 font-medium">
          Foundex Business Consultancy Admin Portal • Executive Slate Theme
        </footer>
      </div>

      {/* Request Details Drawer/Modal */}
      <RequestDetailModal
        request={selectedRequestModal}
        onClose={() => setSelectedRequestModal(null)}
        onUpdateStatus={handleUpdateStatus}
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
