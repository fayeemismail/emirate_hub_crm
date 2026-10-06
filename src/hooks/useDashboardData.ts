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
import { leadsApi, analyticsApi, LeadItem } from '../lib/api';
import {
  leadToServiceRequest,
  sortByCreatedAtDesc,
  sortRequestsForTable,
  requestPriorityToBackendEnum,
  normalizeLeadNotes,
} from '../lib/adapters';
import { tableSortToApi, type TableSortMode } from '../lib/crmSettings';
import { useCrmSettings } from './useCrmSettings';

function flattenLeadsPayload(
  raw: LeadItem[] | Record<string, LeadItem[]> | null | undefined
): LeadItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return Object.values(raw).flat();
}

/** Inquiry list filters driven by the BE admin leads query. */
export interface InquiryListQuery {
  search: string;
  service: string; // 'All' = no filter; otherwise Sanity service slug
  status: string; // 'All' = no filter; otherwise Sanity status slug
  tableSort: TableSortMode;
  viewMode: 'kanban' | 'table';
  /** When true, apply Settings lookback to the leads fetch (Service Inquiries only). */
  applyLookback: boolean;
}

export const DEFAULT_INQUIRY_LIST_QUERY: InquiryListQuery = {
  search: '',
  service: 'All',
  status: 'All',
  tableSort: 'newest',
  viewMode: 'kanban',
  applyLookback: false,
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
  /** All-time board (dashboard / orphans). Never clipped by lookback. */
  const [allTimeRequests, setAllTimeRequests] = useState<ServiceRequest[]>([]);
  /** Lookback (+ optional inquiry filters) list for Service Inquiries. */
  const [inquiryRequests, setInquiryRequests] = useState<ServiceRequest[]>([]);
  /** `lookbackDays` value that `inquiryRequests` was fetched with; null = not loaded. */
  const [inquiryScopeDays, setInquiryScopeDays] = useState<number | null>(null);
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
  const applyLookbackRef = useRef(false);

  const usingInquiryList =
    inquiryQuery.applyLookback && lookbackDays > 0;
  applyLookbackRef.current = usingInquiryList;

  const inquiryScopeReady =
    !usingInquiryList || inquiryScopeDays === lookbackDays;

  const requests = usingInquiryList ? inquiryRequests : allTimeRequests;

  const patchRequestEverywhere = useCallback(
    (id: string, fn: (req: ServiceRequest) => ServiceRequest) => {
      const map = (prev: ServiceRequest[]) =>
        prev.map((req) => (req.id === id ? fn(req) : req));
      setAllTimeRequests(map);
      setInquiryRequests(map);
    },
    []
  );

  const removeRequestEverywhere = useCallback((id: string) => {
    const filt = (prev: ServiceRequest[]) => prev.filter((req) => req.id !== id);
    setAllTimeRequests(filt);
    setInquiryRequests(filt);
  }, []);

  const syncIdsInto = (
    prev: ServiceRequest[],
    incoming: ServiceRequest[]
  ): ServiceRequest[] => {
    const byId = new Map(incoming.map((r) => [r.id, r]));
    return prev.map((r) => byId.get(r.id) ?? r);
  };

  const replaceActiveRequests = useCallback((next: ServiceRequest[]) => {
    if (applyLookbackRef.current) {
      setInquiryRequests(next);
      setAllTimeRequests((prev) => syncIdsInto(prev, next));
    } else {
      setAllTimeRequests(next);
      setInquiryRequests((prev) => syncIdsInto(prev, next));
    }
  }, []);

  const loadBackendData = useCallback(async () => {
    if (!isAuthenticated || !settingsHydrated) return;
    const gen = ++loadGen.current;
    setIsDataLoading(true);

    const isTable = inquiryQuery.viewMode === 'table';
    const { sortBy, sortOrder } = tableSortToApi(inquiryQuery.tableSort);
    const applyLookback = inquiryQuery.applyLookback && lookbackDays > 0;
    const search = inquiryQuery.search.trim();
    const service = inquiryQuery.service;
    const status = inquiryQuery.status;
    const hasInquiryFilters =
      Boolean(search) ||
      service !== 'All' ||
      (isTable && status !== 'All');

    try {
      const workspaceLeadsPromise = leadsApi.getAdminLeads({ view: 'kanban' });

      // Prefetch lookback list whenever Settings lookback is on, so the sidebar
      // pill and Service Inquiries page share the same count (no 21→3 flash).
      const lookbackBaselinePromise =
        lookbackDays > 0
          ? leadsApi.getAdminLeads({
              view: 'kanban',
              lookbackDays,
              sortBy,
              sortOrder,
            })
          : Promise.resolve(null);

      const filteredInquiryPromise =
        applyLookback && hasInquiryFilters
          ? leadsApi.getAdminLeads({
              view: 'kanban',
              lookbackDays,
              sortBy,
              sortOrder,
              ...(search ? { search } : {}),
              ...(service !== 'All' ? { service } : {}),
              ...(isTable && status !== 'All' ? { status } : {}),
            })
          : Promise.resolve(null);

      const [
        workspaceRes,
        lookbackRes,
        filteredRes,
        statusesRes,
        servicesCatalogRes,
        overviewRes,
        trendsRes,
        yearsRes,
        servicesRes,
        funnelRes,
      ] = await Promise.allSettled([
        workspaceLeadsPromise,
        lookbackBaselinePromise,
        filteredInquiryPromise,
        leadsApi.getLeadStatuses(),
        leadsApi.getLeadServices(),
        analyticsApi.getOverview(),
        analyticsApi.getMonthlyTrends({ year: new Date().getFullYear() }),
        analyticsApi.getAvailableYears(),
        analyticsApi.getServiceAnalytics(),
        analyticsApi.getFunnelAnalytics(),
      ]);

      if (gen !== loadGen.current) return;

      let nextPipeline: PipelineStatus[] = [];
      if (statusesRes.status === 'fulfilled' && statusesRes.value?.data) {
        const payload = statusesRes.value.data;
        nextPipeline = [...(payload.statuses || [])].sort((a, b) => a.order - b.order);
        setPipelineStatuses(nextPipeline);
        setDefaultStatusSlug(
          payload.defaultStatus ||
            nextPipeline.find((s) => s.isDefault)?.slug ||
            nextPipeline[0]?.slug ||
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

      const mapLeads = (raw: unknown): ServiceRequest[] => {
        const rawList = flattenLeadsPayload(
          raw as LeadItem[] | Record<string, LeadItem[]> | null | undefined
        );
        let mapped = rawList
          .map(leadToServiceRequest)
          .filter((req) => !req.isDeleted);
        if (applyLookback && isTable) {
          mapped = sortRequestsForTable(
            mapped,
            inquiryQuery.tableSort,
            nextPipeline
          );
        }
        return mapped;
      };

      if (workspaceRes.status === 'fulfilled' && workspaceRes.value?.data) {
        setAllTimeRequests(mapLeads(workspaceRes.value.data));
      } else {
        setAllTimeRequests([]);
      }

      if (lookbackDays > 0) {
        const baseline =
          lookbackRes.status === 'fulfilled' && lookbackRes.value?.data
            ? mapLeads(lookbackRes.value.data)
            : [];
        const filtered =
          filteredRes.status === 'fulfilled' && filteredRes.value?.data
            ? mapLeads(filteredRes.value.data)
            : null;
        const nextInquiry = filtered ?? baseline;
        setInquiryRequests(nextInquiry);
        setInquiryScopeDays(lookbackDays);
        if (applyLookback) {
          setLeadsTotal(nextInquiry.length);
        } else if (workspaceRes.status === 'fulfilled' && workspaceRes.value?.data) {
          setLeadsTotal(mapLeads(workspaceRes.value.data).length);
        }
      } else {
        const all =
          workspaceRes.status === 'fulfilled' && workspaceRes.value?.data
            ? mapLeads(workspaceRes.value.data)
            : [];
        setInquiryRequests(all);
        setInquiryScopeDays(0);
        setLeadsTotal(all.length);
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
      setAllTimeRequests([]);
      setInquiryRequests([]);
      setInquiryScopeDays(null);
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
    inquiryQuery.applyLookback,
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
    async (id: string, newStatus: RequestStatus, boardOrder?: number) => {
      let snapshot: ServiceRequest | undefined;
      const nowIso = new Date().toISOString();

      const applyLocal = (req: ServiceRequest): ServiceRequest => {
        const fromStatus = req.status;
        const nextOrder =
          boardOrder !== undefined ? boardOrder : (req.boardOrder ?? 0);
        if (fromStatus === newStatus) {
          return { ...req, boardOrder: nextOrder };
        }
        return {
          ...req,
          status: newStatus,
          boardOrder: nextOrder,
          statusChangedAt: nowIso,
          statusHistory: [
            ...(req.statusHistory || []),
            {
              fromStatus,
              toStatus: newStatus,
              changedAt: nowIso,
              changedBy: 'ADMIN',
            },
          ],
        };
      };

      snapshot = (applyLookbackRef.current ? inquiryRequests : allTimeRequests).find(
        (r) => r.id === id
      );
      patchRequestEverywhere(id, applyLocal);

      if (onModalRequestUpdate) {
        onModalRequestUpdate((prev) => (prev?.id === id ? applyLocal(prev) : prev));
      }

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) return true;

      const orderForApi =
        boardOrder !== undefined
          ? boardOrder
          : (snapshot?.boardOrder ?? 0);

      try {
        const res = await leadsApi.updateLeadStatus(id, newStatus, orderForApi);
        if (res.data) {
          const mapped = leadToServiceRequest(res.data);
          const mergeHistory = (current?: ServiceRequest): ServiceRequest => {
            const apiHistory = mapped.statusHistory || [];
            const localHistory = current?.statusHistory || [];
            // Prefer the longer trail so a thin API payload can't wipe optimistic rows.
            const statusHistory =
              apiHistory.length >= localHistory.length ? apiHistory : localHistory;
            return {
              ...mapped,
              statusHistory,
              statusChangedAt: mapped.statusChangedAt || current?.statusChangedAt || nowIso,
            };
          };
          patchRequestEverywhere(id, (req) => mergeHistory(req));
          if (onModalRequestUpdate) {
            onModalRequestUpdate((prev) =>
              prev?.id === id ? mergeHistory(prev) : prev
            );
          }
        }
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Could not sync status to backend for lead ${id}:`, message);
        if (snapshot) {
          const rollback = snapshot;
          patchRequestEverywhere(id, () => rollback);
          if (onModalRequestUpdate) {
            onModalRequestUpdate((prev) => (prev?.id === id ? rollback : prev));
          }
        }
        return false;
      }
    },
    [allTimeRequests, inquiryRequests, onModalRequestUpdate, patchRequestEverywhere]
  );

  const handleKanbanSync = useCallback(
    async (
      nextRequests: ServiceRequest[],
      previousRequests: ServiceRequest[]
    ): Promise<boolean> => {
      const nowIso = new Date().toISOString();
      const enriched = nextRequests.map((next) => {
        const prev = previousRequests.find((p) => p.id === next.id);
        if (!prev || prev.status === next.status) return next;
        return {
          ...next,
          statusChangedAt: nowIso,
          statusHistory: [
            ...(prev.statusHistory || []),
            {
              fromStatus: prev.status,
              toStatus: next.status,
              changedAt: nowIso,
              changedBy: 'ADMIN',
            },
          ],
        };
      });

      replaceActiveRequests(enriched);
      if (onModalRequestUpdate) {
        onModalRequestUpdate((modal) => {
          if (!modal) return modal;
          const updated = enriched.find((r) => r.id === modal.id);
          return updated ?? modal;
        });
      }

      const changed = enriched.filter((next) => {
        const prev = previousRequests.find((p) => p.id === next.id);
        if (!prev) return false;
        return (
          prev.status !== next.status ||
          (prev.boardOrder ?? 0) !== (next.boardOrder ?? 0)
        );
      });

      if (changed.length === 0) return true;

      try {
        const results = await Promise.all(
          changed.map(async (req) => {
            if (!/^[0-9a-fA-F]{24}$/.test(req.id)) return null;
            const res = await leadsApi.updateLeadStatus(
              req.id,
              req.status,
              req.boardOrder ?? 0
            );
            return res.data ? leadToServiceRequest(res.data) : null;
          })
        );

        const byId = new Map(
          results.filter((r): r is ServiceRequest => Boolean(r)).map((r) => [r.id, r])
        );
        if (byId.size > 0) {
          const mergeMapped = (req: ServiceRequest): ServiceRequest => {
            const mapped = byId.get(req.id);
            if (!mapped) return req;
            const apiHistory = mapped.statusHistory || [];
            const localHistory = req.statusHistory || [];
            return {
              ...mapped,
              statusHistory:
                apiHistory.length >= localHistory.length ? apiHistory : localHistory,
              statusChangedAt: mapped.statusChangedAt || req.statusChangedAt,
            };
          };
          setAllTimeRequests((prev) => prev.map(mergeMapped));
          setInquiryRequests((prev) => prev.map(mergeMapped));
          if (onModalRequestUpdate) {
            onModalRequestUpdate((modal) => {
              if (!modal) return modal;
              return mergeMapped(modal);
            });
          }
        }
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Kanban sync failed, rolling back:', message);
        replaceActiveRequests(previousRequests);
        if (onModalRequestUpdate) {
          onModalRequestUpdate((modal) => {
            if (!modal) return modal;
            return previousRequests.find((r) => r.id === modal.id) ?? modal;
          });
        }
        return false;
      }
    },
    [onModalRequestUpdate, replaceActiveRequests]
  );

  const handleUpdatePriority = useCallback(
    async (id: string, newPriority: RequestPriority) => {
      const snapshot = (applyLookbackRef.current ? inquiryRequests : allTimeRequests).find(
        (r) => r.id === id
      );
      patchRequestEverywhere(id, (req) => ({ ...req, priority: newPriority }));

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
          patchRequestEverywhere(id, () => rollback);
          if (onModalRequestUpdate) {
            onModalRequestUpdate((prev) => (prev?.id === id ? rollback : prev));
          }
        }
        return false;
      }
    },
    [allTimeRequests, inquiryRequests, onModalRequestUpdate, patchRequestEverywhere]
  );

  const handleDeleteRequest = useCallback(
    async (id: string) => {
      const snapshot = (applyLookbackRef.current ? inquiryRequests : allTimeRequests).find(
        (req) => req.id === id
      );
      removeRequestEverywhere(id);
      setLeadsTotal((t) => Math.max(0, t - 1));

      if (onModalRequestUpdate) {
        onModalRequestUpdate((prev) => (prev?.id === id ? null : prev));
      }

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) {
        throw new Error('This lead cannot be archived (invalid id).');
      }

      try {
        await leadsApi.deleteLead(id);
        await loadBackendData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (snapshot) {
          const rollback = snapshot;
          const restore = (prev: ServiceRequest[]) => {
            if (prev.some((req) => req.id === id)) return prev;
            return [...prev, rollback].sort(sortByCreatedAtDesc);
          };
          setAllTimeRequests(restore);
          setInquiryRequests(restore);
          setLeadsTotal((t) => t + 1);
          if (onModalRequestUpdate) {
            onModalRequestUpdate((prev) => (prev?.id === id ? rollback : prev ?? rollback));
          }
        }
        throw new Error(message || 'Could not archive inquiry. Try again.');
      }
    },
    [
      allTimeRequests,
      inquiryRequests,
      loadBackendData,
      onModalRequestUpdate,
      removeRequestEverywhere,
    ]
  );

  const handleRestoreRequest = useCallback(
    async (id: string) => {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) {
        throw new Error('This lead cannot be restored (invalid id).');
      }

      try {
        await leadsApi.restoreLead(id);
        if (onModalRequestUpdate) {
          onModalRequestUpdate((prev) => (prev?.id === id ? null : prev));
        }
        await loadBackendData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(message || 'Could not restore inquiry. Try again.');
      }
    },
    [loadBackendData, onModalRequestUpdate]
  );

  const handleAddNote = useCallback(
    async (id: string, noteText: string) => {
      const trimmed = noteText.trim();
      if (!trimmed) return;

      const optimisticNote = {
        text: trimmed,
        createdAt: new Date().toISOString(),
        createdBy: 'You',
      };

      let snapshot: ServiceRequest | undefined;

      snapshot = (applyLookbackRef.current ? inquiryRequests : allTimeRequests).find(
        (req) => req.id === id
      );
      patchRequestEverywhere(id, (req) => ({
        ...req,
        notes: [...(req.notes || []), optimisticNote],
      }));

      if (onModalRequestUpdate) {
        onModalRequestUpdate((prev) => {
          if (prev?.id === id) {
            return { ...prev, notes: [...(prev.notes || []), optimisticNote] };
          }
          return prev;
        });
      }

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) return;

      try {
        const res = await leadsApi.updateLeadDetails(id, { note: trimmed });
        const savedNotes = normalizeLeadNotes(
          res.data?.notes,
          res.data?.updatedAt
        );
        patchRequestEverywhere(id, (req) => ({ ...req, notes: savedNotes }));
        if (onModalRequestUpdate) {
          onModalRequestUpdate((prev) =>
            prev?.id === id ? { ...prev, notes: savedNotes } : prev
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Could not sync note to backend for lead ${id}:`, message);
        if (snapshot) {
          const rollback = snapshot;
          patchRequestEverywhere(id, () => rollback);
          if (onModalRequestUpdate) {
            onModalRequestUpdate((prev) => (prev?.id === id ? rollback : prev));
          }
        }
        throw err;
      }
    },
    [allTimeRequests, inquiryRequests, onModalRequestUpdate, patchRequestEverywhere]
  );

  const handleSubmitNewRequest = useCallback(
    async (
      newReqData: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'priority'>
    ) => {
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
        source: 'manual',
        formData: {
          companyName: newReqData.companyName,
        },
      });

      if (!res.data) {
        throw new Error(res.message || 'Lead was not created. Try again.');
      }

      const mappedNewLead = leadToServiceRequest({
        ...res.data,
        source: 'manual',
      });
      const prepend = (prev: ServiceRequest[]) =>
        [mappedNewLead, ...prev].sort(sortByCreatedAtDesc);
      setAllTimeRequests(prepend);
      setInquiryRequests(prepend);
      setLeadsTotal((t) => t + 1);
      loadBackendData();
    },
    [loadBackendData]
  );

  const pendingSlug =
    defaultStatusSlug ||
    pipelineStatuses.find((s) => s.isDefault)?.slug ||
    pipelineStatuses[0]?.slug ||
    '';

  /** Sidebar pill: pending in the Settings lookback window (matches Service Inquiries). */
  const navPendingCount = pendingSlug
    ? (lookbackDays > 0 ? inquiryRequests : allTimeRequests).filter(
        (r) => r.status === pendingSlug
      ).length
    : 0;

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
    navPendingCount,
    inquiryScopeReady,
    isDataLoading,
    isInitialLoading: isDataLoading && !hasLoadedOnce,
    isRefreshing: isDataLoading && hasLoadedOnce,
    /** True while Service Inquiries would otherwise flash the wrong (all-time) list. */
    isInquiryListLoading: usingInquiryList && !inquiryScopeReady,
    loadBackendData,
    handleUpdateStatus,
    handleKanbanSync,
    handleUpdatePriority,
    handleDeleteRequest,
    handleRestoreRequest,
    handleAddNote,
    handleSubmitNewRequest,
  };
}
