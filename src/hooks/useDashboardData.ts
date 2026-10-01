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
  sortByBoardOrder, 
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
          .sort(sortByBoardOrder);
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

  // Optimistic status change with rollback on failure
  const handleUpdateStatus = useCallback(async (id: string, newStatus: RequestStatus, boardOrder = 0) => {
    let snapshot: ServiceRequest | undefined;
    setRequests(prev => {
      snapshot = prev.find(r => r.id === id);
      return prev.map(req =>
        req.id === id ? { ...req, status: newStatus, boardOrder } : req
      );
    });

    if (onModalRequestUpdate) {
      onModalRequestUpdate(prev =>
        prev?.id === id ? { ...prev, status: newStatus, boardOrder } : prev
      );
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) return true;

    try {
      const backendSlug = requestStatusToBackendSlug(newStatus);
      await leadsApi.updateLeadStatus(id, backendSlug, boardOrder, `Status moved to ${newStatus}`);
      return true;
    } catch (err: any) {
      console.warn(`Could not sync status to backend for lead ${id}:`, err?.message || err);
      if (snapshot) {
        const rollback = snapshot;
        setRequests(prev => prev.map(req => (req.id === id ? rollback : req)));
        if (onModalRequestUpdate) {
          onModalRequestUpdate(prev => (prev?.id === id ? rollback : prev));
        }
      }
      return false;
    }
  }, [onModalRequestUpdate]);

  /**
   * Persist a full kanban column snapshot (status + boardOrder) with optimistic UI + rollback.
   */
  const handleKanbanSync = useCallback(async (
    nextRequests: ServiceRequest[],
    previousRequests: ServiceRequest[]
  ): Promise<boolean> => {
    setRequests(nextRequests);

    const changed = nextRequests.filter((next) => {
      const prev = previousRequests.find((p) => p.id === next.id);
      if (!prev) return false;
      return prev.status !== next.status || (prev.boardOrder ?? 0) !== (next.boardOrder ?? 0);
    });

    if (changed.length === 0) return true;

    try {
      await Promise.all(
        changed.map(async (req) => {
          if (!/^[0-9a-fA-F]{24}$/.test(req.id)) return;
          const slug = requestStatusToBackendSlug(req.status);
          await leadsApi.updateLeadStatus(
            req.id,
            slug,
            req.boardOrder ?? 0,
            `Board sync → ${req.status}`
          );
        })
      );
      return true;
    } catch (err: any) {
      console.warn('Kanban sync failed, rolling back:', err?.message || err);
      setRequests(previousRequests);
      return false;
    }
  }, []);

  // Handle admin changing priority with live backend sync
  const handleUpdatePriority = useCallback(async (id: string, newPriority: RequestPriority) => {
    let snapshot: ServiceRequest | undefined;
    setRequests(prev => {
      snapshot = prev.find(r => r.id === id);
      return prev.map(req =>
        req.id === id ? { ...req, priority: newPriority } : req
      );
    });

    if (onModalRequestUpdate) {
      onModalRequestUpdate(prev => (prev?.id === id ? { ...prev, priority: newPriority } : prev));
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) return;

    try {
      const backendPriority = requestPriorityToBackendEnum(newPriority);
      await leadsApi.updateLeadDetails(id, { priority: backendPriority });
    } catch (err: any) {
      console.warn(`Could not sync priority to backend for lead ${id}:`, err?.message || err);
      if (snapshot) {
        const rollback = snapshot;
        setRequests(prev => prev.map(req => (req.id === id ? rollback : req)));
      }
    }
  }, [onModalRequestUpdate]);

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
        setRequests(prev => [mappedNewLead, ...prev].sort(sortByBoardOrder));
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
          boardOrder: Date.now(),
          notes: [],
          isDeleted: false,
        };
        setRequests(prev => [newRequest, ...prev].sort(sortByBoardOrder));
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
        boardOrder: Date.now(),
        notes: [],
        isDeleted: false,
      };
      setRequests(prev => [newRequest, ...prev].sort(sortByBoardOrder));
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
    handleKanbanSync,
    handleUpdatePriority,
    handleDeleteRequest,
    handleAddNote,
    handleSubmitNewRequest,
  };
}
