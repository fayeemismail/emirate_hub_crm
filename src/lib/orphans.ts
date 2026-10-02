import { PipelineStatus, ServiceRequest } from '../types';
import { sortByBoardOrder } from './adapters';

/** Leads whose status slug is not in the active CMS pipeline. */
export function getOrphanRequests(
  requests: ServiceRequest[],
  pipelineStatuses: PipelineStatus[]
): ServiceRequest[] {
  const activeSlugs = new Set(pipelineStatuses.map((s) => s.slug));
  return [...requests]
    .filter((r) => Boolean(r.status) && !activeSlugs.has(r.status))
    .sort(sortByBoardOrder);
}
