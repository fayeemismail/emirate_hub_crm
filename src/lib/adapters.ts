import { LeadItem } from './api';
import { ServiceRequest, RequestPriority, PipelineStatus } from '../types';

/**
 * Maps a backend LeadItem to frontend ServiceRequest.
 * Status is the Sanity slug from crm-be — no UI remapping.
 */
export function leadToServiceRequest(lead: LeadItem): ServiceRequest {
  const rawStatus = (lead.status || '').toLowerCase().trim();

  let priority: RequestPriority = 'Medium';
  const rawPriority = (lead.priority || '').toUpperCase();
  if (rawPriority === 'LOW') priority = 'Low';
  else if (rawPriority === 'HIGH' || rawPriority === 'URGENT') priority = 'High';

  const fullName =
    (lead as { name?: string }).name ||
    lead.fullName ||
    `${lead.firstName || ''} ${lead.lastName || ''}`.trim() ||
    'Client';
  const nameParts = fullName.split(/\s+/);
  const firstName = lead.firstName || nameParts[0] || 'Client';
  const lastName =
    lead.lastName !== undefined
      ? lead.lastName
      : nameParts.slice(1).join(' ') || '';

  return {
    id: lead.id || (lead as { _id?: string })._id || lead.referenceId,
    name: fullName,
    firstName,
    lastName,
    email: lead.email,
    phone: lead.phone,
    service: lead.service,
    ...(lead.serviceSlug ? { serviceSlug: lead.serviceSlug } : {}),
    message: lead.message || '',
    createdAt: (() => {
      const raw = lead.createdAt;
      if (!raw) return new Date().toISOString();
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    })(),
    status: rawStatus || 'unknown',
    statusChangedAt: (() => {
      const raw = lead.statusChangedAt || lead.createdAt;
      if (!raw) return undefined;
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    })(),
    statusHistory: Array.isArray(lead.statusHistory)
      ? lead.statusHistory.map((entry) => ({
          fromStatus: entry.fromStatus || '',
          toStatus: entry.toStatus || rawStatus,
          changedAt: entry.changedAt,
          changedBy: entry.changedBy || 'SYSTEM',
        }))
      : [],
    priority,
    boardOrder: typeof lead.boardOrder === 'number' ? lead.boardOrder : 0,
    notes: Array.isArray(lead.notes) ? lead.notes : [],
    companyName: lead.formData?.companyName as string | undefined,
    isDeleted: (lead as { isDeleted?: boolean }).isDeleted || false,
  };
}

export const getPriorityRank = (priority: RequestPriority): number => {
  switch (priority) {
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    case 'Low':
    default:
      return 1;
  }
};

export const sortByPriorityDesc = (a: ServiceRequest, b: ServiceRequest): number => {
  const rankDiff = getPriorityRank(b.priority) - getPriorityRank(a.priority);
  if (rankDiff !== 0) return rankDiff;
  return sortByCreatedAtDesc(a, b);
};

/** Newest submissions first (dashboard Recent inquiries / default list order). */
export const sortByCreatedAtDesc = (
  a: ServiceRequest,
  b: ServiceRequest
): number => {
  const aTime = Date.parse(a.createdAt) || 0;
  const bTime = Date.parse(b.createdAt) || 0;
  if (bTime !== aTime) return bTime - aTime;
  return String(b.id).localeCompare(String(a.id));
};

/** Top N newest inquiries for the dashboard widget. */
export function getRecentInquiries(
  requests: ServiceRequest[],
  limit = 5
): ServiceRequest[] {
  return [...requests].sort(sortByCreatedAtDesc).slice(0, limit);
}

export const sortByBoardOrder = (a: ServiceRequest, b: ServiceRequest): number => {
  const orderDiff = (a.boardOrder ?? 0) - (b.boardOrder ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return sortByCreatedAtDesc(a, b);
};

export const sortByCreatedAtAsc = (
  a: ServiceRequest,
  b: ServiceRequest
): number => -sortByCreatedAtDesc(a, b);

/** Pipeline stage order (Sanity order), then newest within a stage. */
export function sortByStatusPipeline(
  pipelineStatuses: PipelineStatus[]
): (a: ServiceRequest, b: ServiceRequest) => number {
  const orderMap = new Map(
    [...pipelineStatuses]
      .sort((a, b) => a.order - b.order)
      .map((s, index) => [s.slug, index] as const)
  );
  const rank = (slug: string) =>
    orderMap.has(slug) ? (orderMap.get(slug) as number) : Number.MAX_SAFE_INTEGER;

  return (a, b) => {
    const diff = rank(a.status) - rank(b.status);
    if (diff !== 0) return diff;
    return sortByCreatedAtDesc(a, b);
  };
}

export function requestPriorityToBackendEnum(
  priority: RequestPriority
): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  switch (priority) {
    case 'Low':
      return 'LOW';
    case 'Medium':
      return 'MEDIUM';
    case 'High':
      return 'HIGH';
  }
}

export function findPipelineStatus(
  statuses: PipelineStatus[],
  slug: string
): PipelineStatus | undefined {
  const normalized = (slug || '').toLowerCase().trim();
  return statuses.find((s) => s.slug === normalized);
}

export function statusTitle(statuses: PipelineStatus[], slug: string): string {
  return findPipelineStatus(statuses, slug)?.title || slug || 'Unknown';
}
