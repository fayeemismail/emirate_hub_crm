import { LeadItem } from './api';
import { ServiceRequest, RequestStatus, RequestPriority, MessagesGraphData } from '../types';

/**
 * Maps a backend LeadItem to frontend ServiceRequest interface.
 */
export function leadToServiceRequest(lead: LeadItem): ServiceRequest {
  let status: RequestStatus = 'Pending';
  const rawStatus = (lead.status || '').toLowerCase();

  if (rawStatus === 'new') {
    status = 'Pending';
  } else if (['contacted', 'in_review', 'proposal_sent', 'in progress'].includes(rawStatus)) {
    status = 'In Progress';
  } else if (['qualified', 'won', 'resolved'].includes(rawStatus)) {
    status = 'Resolved';
  } else if (['lost', 'archived'].includes(rawStatus)) {
    status = 'Archived';
  }

  let priority: RequestPriority = 'Medium';
  const rawPriority = (lead.priority || '').toUpperCase();
  if (rawPriority === 'LOW') priority = 'Low';
  else if (rawPriority === 'HIGH' || rawPriority === 'URGENT') priority = 'High';

  const fullName = (lead as any).name || lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client';
  const nameParts = fullName.split(/\s+/);
  const firstName = lead.firstName || nameParts[0] || 'Client';
  const lastName = lead.lastName !== undefined ? lead.lastName : (nameParts.slice(1).join(' ') || '');

  return {
    id: lead.id || (lead as any)._id || lead.referenceId,
    name: fullName,
    firstName,
    lastName,
    email: lead.email,
    phone: lead.phone,
    service: lead.service,
    message: lead.message || '',
    createdAt: lead.createdAt || new Date().toISOString(),
    status,
    priority,
    notes: (lead as any).notes || ['Inquiry submitted via Emirate Hub portal.'],
    companyName: lead.formData?.companyName as string | undefined,
    isDeleted: (lead as any).isDeleted || false,
  };
}

export const getPriorityRank = (priority: RequestPriority): number => {
  switch (priority) {
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    case 'Low':
      return 1;
    default:
      return 0;
  }
};

export const sortByPriorityDesc = (a: ServiceRequest, b: ServiceRequest): number => {
  const rankDiff = getPriorityRank(b.priority) - getPriorityRank(a.priority);
  if (rankDiff !== 0) return rankDiff;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

/**
 * Maps frontend RequestStatus to backend status slug.
 */
export function requestStatusToBackendSlug(status: RequestStatus): string {
  switch (status) {
    case 'Pending':
      return 'new';
    case 'In Progress':
      return 'in_review';
    case 'Resolved':
      return 'won';
    case 'Archived':
      return 'archived';
    default:
      return 'new';
  }
}

/**
 * Maps frontend RequestPriority to backend priority enum.
 */
export function requestPriorityToBackendEnum(priority: RequestPriority): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  switch (priority) {
    case 'Low':
      return 'LOW';
    case 'Medium':
      return 'MEDIUM';
    case 'High':
      return 'HIGH';
  }
}
