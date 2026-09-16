'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ServiceRequest, 
  RequestStatus, 
  RequestPriority, 
  OverviewKpi,
  MonthlyTrendsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse 
} from '../types';
import { leadsApi, analyticsApi } from '../lib/api';
import { 
  leadToServiceRequest, 
  requestStatusToBackendSlug, 
  sortByPriorityDesc, 
  requestPriorityToBackendEnum 
} from '../lib/adapters';

interface UseDashboardDataOptions {
  isAuthenticated: boolean;
  onModalRequestUpdate?: (updater: (prev: ServiceRequest | null) => ServiceRequest | null) => void;
}

export function useDashboardData({ isAuthenticated, onModalRequestUpdate }: UseDashboardDataOptions) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [overviewKpi, setOverviewKpi] = useState<OverviewKpi | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendsResponse | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalyticsResponse | null>(null);
  const [funnelAnalytics, setFunnelAnalytics] = useState<FunnelAnalyticsResponse | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Fetch leads and analytics from backend
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

  // Handle request status change with live backend sync
  const handleUpdateStatus = useCallback(async (id: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    }));

    if (onModalRequestUpdate) {
      onModalRequestUpdate(prev => (prev?.id === id ? { ...prev, status: newStatus } : prev));
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) return;

    try {
      const backendSlug = requestStatusToBackendSlug(newStatus);
      await leadsApi.updateLeadStatus(id, backendSlug, 0, `Status moved to ${newStatus}`);
      loadBackendData();
    } catch (err: any) {
      console.warn(`Could not sync status to backend for lead ${id}:`, err?.message || err);
    }
  }, [loadBackendData, onModalRequestUpdate]);

  // Handle admin changing priority with live backend sync and priority re-sort
  const handleUpdatePriority = useCallback(async (id: string, newPriority: RequestPriority) => {
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === id) {
          return { ...req, priority: newPriority };
        }
        return req;
      });
      return updated.sort(sortByPriorityDesc);
    });

    if (onModalRequestUpdate) {
      onModalRequestUpdate(prev => (prev?.id === id ? { ...prev, priority: newPriority } : prev));
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
  }, [loadBackendData, onModalRequestUpdate]);

  // Handle soft delete with live backend sync
  const handleDeleteRequest = useCallback(async (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));

    if (onModalRequestUpdate) {
      onModalRequestUpdate(prev => (prev?.id === id ? null : prev));
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) return;

    try {
      await leadsApi.deleteLead(id);
      loadBackendData();
    } catch (err: any) {
      console.warn(`Could not soft delete lead ${id} on backend:`, err?.message || err);
    }
  }, [loadBackendData, onModalRequestUpdate]);

  // Handle adding internal note with live backend sync
  const handleAddNote = useCallback(async (id: string, noteText: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updatedNotes = [...(req.notes || []), noteText];
        return { ...req, notes: updatedNotes };
      }
      return req;
    }));

    if (onModalRequestUpdate) {
      onModalRequestUpdate(prev => {
        if (prev?.id === id) {
          const updatedNotes = [...(prev.notes || []), noteText];
          return { ...prev, notes: updatedNotes };
        }
        return prev;
      });
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) return;

    try {
      await leadsApi.updateLeadDetails(id, { message: noteText });
    } catch (err: any) {
      console.warn(`Could not sync note to backend for lead ${id}:`, err?.message || err);
    }
  }, [onModalRequestUpdate]);

  // Handle new submission simulated from website form with live backend ingestion
  const handleSubmitNewRequest = useCallback(async (
    newReqData: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'priority'>
  ) => {
    try {
      const clientFullName = newReqData.name || `${newReqData.firstName} ${newReqData.lastName}`.trim();
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
        loadBackendData();
      } else {
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

    loadBackendData();
  }, [loadBackendData, requests.length]);

  return {
    requests,
    overviewKpi,
    monthlyTrends,
    serviceAnalytics,
    funnelAnalytics,
    isDataLoading,
    loadBackendData,
    handleUpdateStatus,
    handleUpdatePriority,
    handleDeleteRequest,
    handleAddNote,
    handleSubmitNewRequest,
  };
}
