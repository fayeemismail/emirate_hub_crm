/** Sanity leadStatus slug (SSOT via crm-be). */
export type RequestStatus = string;
export type RequestPriority = 'Low' | 'Medium' | 'High';

/** Pipeline stage from GET /admin/leads/statuses (Sanity via BE). */
export interface PipelineStatus {
  id?: string;
  title: string;
  slug: string;
  order: number;
  color: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
}

/** Service catalog item from GET /admin/leads/services (Sanity via BE). */
export interface CatalogService {
  id?: string;
  title: string;
  slug: string;
  order: number;
  tag?: string;
  description?: string;
  isActive: boolean;
}

export interface ServiceRequest {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string; // Optional phone field
  /** Display title (from BE). */
  service: string;
  /** Stable Sanity service slug when known. */
  serviceSlug?: string;
  message: string;
  createdAt: string; // ISO string or relative time
  status: RequestStatus;
  priority: RequestPriority;
  boardOrder?: number;
  notes?: string[];
  assignedTo?: string;
  companyName?: string;
  isDeleted?: boolean;
}

export interface MessagesGraphData {
  label: string;
  total: number;
  webDev: number;
  aiAutomation: number;
  cloudMigration: number;
  designUiUx: number;
  enterpriseConsulting: number;
}

export interface DashboardMetrics {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
  avgResponseTimeHours: number;
  satisfactionRate: number;
}

export type {
  OverviewKpi,
  MonthlyTrendItem,
  MonthlyTrendsResponse,
  AvailableYearsResponse,
  ServicePerformanceItem,
  ServiceAnalyticsResponse,
  FunnelStageItem,
  FunnelAnalyticsResponse,
} from '../lib/api';

