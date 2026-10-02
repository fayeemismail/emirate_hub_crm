'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ServiceRequest,
  RequestStatus,
  RequestPriority,
  PipelineStatus,
  CatalogService,
  OverviewKpi,
  MonthlyTrendsResponse,
  AvailableYearsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse,
} from '../types';
import { leadsApi, analyticsApi, LeadItem, ApiResponse } from '../lib/api';
import {
  leadToServiceRequest,
  sortByCreatedAtDesc,
  requestPriorityToBackendEnum,
} from '../lib/adapters';
import { lookbackStartIso, tableSortToApi, type TableSortMode } from '../lib/crmSettings';
import { useCrmSettings } from './useCrmSettings';

/** Inquiry list filters driven by the BE admin leads query. */
export interface InquiryListQuery {
  search: string;
  service: string; // 'All' = no filter; otherwise Sanity service slug
  status: string; // 'All' = no filter; otherwise Sanity status slug
  tableSort: TableSortMode;
  viewMode: 'kanban' | 'table';
}

export const DEFAULT_INQUIRY_LIST_QUERY: InquiryListQuery = {
  search: '',
  service: 'All',
  status: 'All',
  tableSort: 'priority',
  viewMode: 'kanban',
};

interface UseDashboardDataOptions {
  isAuthenticated: boolean;
  inquiryQuery?: InquiryListQuery;
  onModalRequestUpdate?: (
    updater: (prev: ServiceRequest | null) => ServiceRequest | null
  ) => void;
}

export function useDashboardData({
  isAuthenticated,
  inquiryQuery = DEFAULT_INQUIRY_LIST_QUERY,
  onModalRequestUpdate,
}: UseDashboardDataOptions) {
  const { lookbackDays, hydrated: settingsHydrated } = useCrmSettings();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [pipelineStatuses, setPipelineStatuses] = useState<PipelineStatus[]>([]);
  const [catalogServices, setCatalogServices] = useState<CatalogService[]>([]);
  const [defaultStatusSlug, setDefaultStatusSlug] = useState<string>('');
  const [overviewKpi, setOverviewKpi] = useState<OverviewKpi | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendsResponse | null>(null);
  const [availableYears, setAvailableYears] = useState<AvailableYearsResponse | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalyticsResponse | null>(null);
  const [funnelAnalytics, setFunnelAnalytics] = useState<FunnelAnalyticsResponse | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const loadGen = useRef(0);

  const loadBackendData = useCallback(async () => {
    if (!isAuthenticated || !settingsHydrated) return;
    const gen = ++loadGen.current;
    setIsDataLoading(true);

    const lookbackStart = lookbackStartIso(lookbackDays);
    const isTable = inquiryQuery.viewMode === 'table';
    const sort = isTable
      ? tableSortToApi(inquiryQuery.tableSort)
      : { sortBy: 'boardOrder' as const, sortOrder: 'asc' as const };

    const search = inquiryQuery.search.trim();
    const service = inquiryQuery.service;
    const status = inquiryQuery.status;

    try {
      const [
        leadsRes,
        statusesRes,
        servicesCatalogRes,
        overviewRes,
        trendsRes,
        yearsRes,
        servicesRes,
        funnelRes,
      ] = await Promise.allSettled([
        leadsApi.getAdminLeads({
          view: 'list',
          limit: 100,
          lookbackDays: lookbackDays > 0 ? lookbackDays : undefined,
          ...(search ? { search } : {}),
          ...(service !== 'All' ? { service } : {}),
          ...(isTable && status !== 'All' ? { status } : {}),
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
        }),
        leadsApi.getLeadStatuses(),
        leadsApi.getLeadServices(),
        analyticsApi.getOverview(
          lookbackStart ? { startDate: lookbackStart } : undefined
        ),
        analyticsApi.getMonthlyTrends({ year: new Date().getFullYear() }),
        analyticsApi.getAvailableYears(),
        analyticsApi.getServiceAnalytics(
          lookbackStart ? { startDate: lookbackStart } : undefined
        ),
        analyticsApi.getFunnelAnalytics(
          lookbackStart ? { startDate: lookbackStart } : undefined
        ),
      ]);

      if (gen !== loadGen.current) return;

      if (statusesRes.status === 'fulfilled' && statusesRes.value?.data) {
        const payload = statusesRes.value.data;
        const sorted = [...(payload.statuses || [])].sort((a, b) => a.order - b.order);
        setPipelineStatuses(sorted);
        setDefaultStatusSlug(
          payload.defaultStatus ||
            sorted.find((s) => s.isDefault)?.slug ||
            sorted[0]?.slug ||
            ''
        );
      } else {
        setPipelineStatuses([]);
        setDefaultStatusSlug('');
      }

      if (servicesCatalogRes.status === 'fulfilled' && servicesCatalogRes.value?.data) {
        const payload = servicesCatalogRes.value.data;
        const sorted = [...(payload.services || [])].sort((a, b) => a.order - b.order);
        setCatalogServices(sorted);
      } else {
        setCatalogServices([]);
      }

      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data) {
        const raw = leadsRes.value.data;
        const rawList = Array.isArray(raw) ? raw : [];
        const mapped = rawList
          .filter((l) => !(l as LeadItem & { isDeleted?: boolean }).isDeleted)
          .map(leadToServiceRequest);
        setRequests(mapped);
        const pagination = (
          leadsRes.value as ApiResponse<LeadItem[]> & {
            pagination?: { totalItems?: number };
          }
        ).pagination;
        setLeadsTotal(
          typeof pagination?.totalItems === 'number' ? pagination.totalItems : mapped.length
        );
      } else {
        setRequests([]);
        setLeadsTotal(0);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setOverviewKpi(overviewRes.value.data);
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value?.data) {
        setMonthlyTrends(trendsRes.value.data);
      }
      if (yearsRes.status === 'fulfilled' && yearsRes.value?.data) {
        setAvailableYears(yearsRes.value.data);
      } else {
        const y = new Date().getFullYear();
        setAvailableYears({ years: [y], currentYear: y });
      }
      if (servicesRes.status === 'fulfilled' && servicesRes.value?.data) {
        setServiceAnalytics(servicesRes.value.data);
      }
      if (funnelRes.status === 'fulfilled' && funnelRes.value?.data) {
        setFunnelAnalytics(funnelRes.value.data);
      }
    } catch (err) {
      if (gen !== loadGen.current) return;
      console.error('Failed to load live backend data:', err);
      setRequests([]);
      setLeadsTotal(0);
    } finally {
      if (gen === loadGen.current) {
        setIsDataLoading(false);
        setHasLoadedOnce(true);
      }
    }
  }, [
    isAuthenticated,
    settingsHydrated,
    lookbackDays,
    inquiryQuery.search,
    inquiryQuery.service,
    inquiryQuery.status,
    inquiryQuery.tableSort,
    inquiryQuery.viewMode,
  ]);

  useEffect(() => {
    if (isAuthenticated && settingsHydrated) {
      loadBackendData();
    }
  }, [isAuthenticated, settingsHydrated, loadBackendData]);

  const handleUpdateStatus = useCallback(
    async (id: string, newStatus: RequestStatus, boardOrder = 0) => {
      let snapshot: ServiceRequest | undefined;
      setRequests((prev) => {
        snapshot = prev.find((r) => r.id === id);
        return prev.map((req) =>
          req.id === id ? { ...req, status: newStatus, boardOrder } : req
        );
      });

      if (onModalRequestUpdate) {
        onModalRequestUpdate((prev) =>
          prev?.id === id ? { ...prev, status: newStatus, boardOrder } : prev
        );
      }

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) return true;

      try {
        await leadsApi.updateLeadStatus(
          id,
          newStatus,
          boardOrder,
          `Status moved to ${newStatus}`
        );
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Could not sync status to backend for lead ${id}:`, message);
        if (snapshot) {
          const rollback = snapshot;
          setRequests((prev) => prev.map((req) => (req.id === id ? rollback : req)));
          if (onModalRequestUpdate) {
            onModalRequestUpdate((prev) => (prev?.id === id ? rollback : prev));
          }
        }
        return false;
      }
    },
    [onModalRequestUpdate]
  );

  const handleKanbanSync = useCallback(
    async (
      nextRequests: ServiceRequest[],
      previousRequests: ServiceRequest[]
    ): Promise<boolean> => {
      setRequests(nextRequests);

      const changed = nextRequests.filter((next) => {
        const prev = previousRequests.find((p) => p.id === next.id);
        if (!prev) return false;
        return (
          prev.status !== next.status ||
          (prev.boardOrder ?? 0) !== (next.boardOrder ?? 0)
        );
      });

      if (changed.length === 0) return true;

      try {
        await Promise.all(
          changed.map(async (req) => {
            if (!/^[0-9a-fA-F]{24}$/.test(req.id)) return;
            await leadsApi.updateLeadStatus(
              req.id,
              req.status,
              req.boardOrder ?? 0,
              `Board sync → ${req.status}`
            );
          })
        );
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Kanban sync failed, rolling back:', message);
        setRequests(previousRequests);
        return false;
      }
    },
    []
  );

  const handleUpdatePriority = useCallback(
    async (id: string, newPriority: RequestPriority) => {
      let snapshot: ServiceRequest | undefined;
      setRequests((prev) => {
        snapshot = prev.find((r) => r.id === id);
        return prev.map((req) =>
          req.id === id ? { ...req, priority: newPriority } : req
        );
      });

      if (onModalRequestUpdate) {
        onModalRequestUpdate((prev) =>
          prev?.id === id ? { ...prev, priority: newPriority } : prev
        );
      }

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) return true;

      try {
        const backendPriority = requestPriorityToBackendEnum(newPriority);
        await leadsApi.updateLeadDetails(id, { priority: backendPriority });
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Could not sync priority to backend for lead ${id}:`, message);
        if (snapshot) {
          const rollback = snapshot;
          setRequests((prev) => prev.map((req) => (req.id === id ? rollback : req)));
          if (onModalRequestUpdate) {
            onModalRequestUpdate((prev) => (prev?.id === id ? rollback : prev));
          }
        }
        return false;
      }
    },
    [onModalRequestUpdate]
  );

  const handleDeleteRequest = useCallback(
    async (id: string) => {
      setRequests((prev) => prev.filter((req) => req.id !== id));
      setLeadsTotal((t) => Math.max(0, t - 1));

      if (onModalRequestUpdate) {
        onModalRequestUpdate((prev) => (prev?.id === id ? null : prev));
      }

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) return;

      try {
        await leadsApi.deleteLead(id);
        loadBackendData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Could not soft delete lead ${id} on backend:`, message);
      }
    },
    [loadBackendData, onModalRequestUpdate]
  );

  const handleAddNote = useCallback(
    async (id: string, noteText: string) => {
      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === id) {
            const updatedNotes = [...(req.notes || []), noteText];
            return { ...req, notes: updatedNotes };
          }
          return req;
        })
      );

      if (onModalRequestUpdate) {
        onModalRequestUpdate((prev) => {
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Could not sync note to backend for lead ${id}:`, message);
      }
    },
    [onModalRequestUpdate]
  );

  const handleSubmitNewRequest = useCallback(
    async (
      newReqData: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'priority'>
    ) => {
      const initialStatus = defaultStatusSlug || pipelineStatuses.find((s) => s.isDefault)?.slug;
      if (!initialStatus) {
        console.warn(
          'Cannot create local lead fallback: Sanity default status is not loaded yet.'
        );
      }
      try {
        const clientFullName =
          newReqData.name ||
          `${newReqData.firstName} ${newReqData.lastName}`.trim();
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
          setRequests((prev) => [mappedNewLead, ...prev].sort(sortByCreatedAtDesc));
          loadBackendData();
        } else if (initialStatus) {
          const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
          const newRequest: ServiceRequest = {
            ...newReqData,
            name: clientFullName,
            id: newId,
            createdAt: new Date().toISOString(),
            status: initialStatus,
            priority: 'High',
            boardOrder: Date.now(),
            notes: [],
            isDeleted: false,
          };
          setRequests((prev) => [newRequest, ...prev].sort(sortByCreatedAtDesc));
        }
      } catch (err) {
        console.warn('Backend submission failed, saving locally:', err);
        if (!initialStatus) {
          loadBackendData();
          return;
        }
        const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
        const clientFullName =
          newReqData.name ||
          `${newReqData.firstName} ${newReqData.lastName}`.trim();
        const newRequest: ServiceRequest = {
          ...newReqData,
          name: clientFullName,
          id: newId,
          createdAt: new Date().toISOString(),
          status: initialStatus,
          priority: 'High',
          boardOrder: Date.now(),
          notes: [],
          isDeleted: false,
        };
        setRequests((prev) => [newRequest, ...prev].sort(sortByCreatedAtDesc));
      }

      loadBackendData();
    },
    [loadBackendData, requests.length, defaultStatusSlug, pipelineStatuses]
  );

  return {
    requests,
    leadsTotal,
    lookbackDays,
    pipelineStatuses,
    catalogServices,
    defaultStatusSlug,
    overviewKpi,
    monthlyTrends,
    availableYears,
    serviceAnalytics,
    funnelAnalytics,
    isDataLoading,
    isInitialLoading: isDataLoading && !hasLoadedOnce,
    isRefreshing: isDataLoading && hasLoadedOnce,
    loadBackendData,
    handleUpdateStatus,
    handleKanbanSync,
    handleUpdatePriority,
    handleDeleteRequest,
    handleAddNote,
    handleSubmitNewRequest,
  };
}
