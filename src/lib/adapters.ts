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
  } else if (['contacted', 'in_review', 'proposal_sent'].includes(rawStatus)) {
    status = 'In Progress';
  } else if (['qualified', 'won'].includes(rawStatus)) {
    status = 'Resolved';
  } else if (['lost', 'archived'].includes(rawStatus)) {
    status = 'Archived';
  }

  let priority: RequestPriority = 'Medium';
  const rawPriority = (lead.priority || '').toUpperCase();
  if (rawPriority === 'LOW') priority = 'Low';
  else if (rawPriority === 'HIGH' || rawPriority === 'URGENT') priority = 'High';

  const notes = (lead.statusHistory || []).map((h) => {
    const actor = h.changedBy || 'System';
    const msg = h.publicMessage ? ` (${h.publicMessage})` : '';
    return `[${actor}] Status changed from ${h.fromStatus} to ${h.toStatus}${msg}`;
  });

  return {
    id: lead.id || (lead as any)._id || lead.referenceId,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    service: lead.service,
    message: lead.message || '',
    createdAt: lead.createdAt || new Date().toISOString(),
    status,
    priority,
    notes: notes.length > 0 ? notes : ['Inquiry submitted via Foundex portal.'],
    companyName: lead.formData?.companyName as string | undefined,
  };
}

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
