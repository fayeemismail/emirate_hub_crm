export type RequestStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Archived';
export type RequestPriority = 'Low' | 'Medium' | 'High';

export interface ServiceRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string; // Optional phone field
  service: string;
  message: string;
  createdAt: string; // ISO string or relative time
  status: RequestStatus;
  priority: RequestPriority;
  notes?: string[];
  assignedTo?: string;
  companyName?: string;
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
