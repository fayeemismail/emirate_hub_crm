/**
 * Emirate Hub CRM API Client
 * Enterprise REST client with authentication headers, cookie support, and typed endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResult {
  user: UserProfile;
  accessToken: string;
}

export interface LeadItem {
  id: string;
  referenceId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  service: string;
  message?: string;
  status: string;
  boardOrder: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  publicMessage?: string;
  formData?: Record<string, any>;
  statusHistory?: Array<{
    fromStatus: string;
    toStatus: string;
    changedAt: string;
    changedBy: string;
    publicMessage?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OverviewKpi {
  totalLeads: number;
  activeLeads: number;
  archivedLeads: number;
  currentMonthLeads: number;
  previousMonthLeads: number;
  momGrowthPercentage: number | null;
  wonLeads: number;
  lostLeads: number;
  winRatePercentage: number;
  avgVelocityHours: number;
  avgVelocityDays: number;
  priorityBreakdown: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface MonthlyTrendItem {
  month: string;
  monthName: string;
  year: number;
  monthNumber: number;
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  inProgressLeads: number;
  winRatePercentage: number;
  momChangePercentage: number | null;
  statusBreakdown: Record<string, number>;
}

export interface MonthlyTrendsResponse {
  year: number;
  totalYearLeads: number;
  overallWinRatePercentage: number;
  trends: MonthlyTrendItem[];
}

export interface ServicePerformanceItem {
  service: string;
  totalInquiries: number;
  sharePercentage: number;
  wonCount: number;
  lostCount: number;
  inProgressCount: number;
  winRatePercentage: number;
  avgCloseTimeDays: number;
}

export interface ServiceAnalyticsResponse {
  totalInquiries: number;
  services: ServicePerformanceItem[];
}

export interface FunnelStageItem {
  slug: string;
  title: string;
  order: number;
  color: string;
  leadCount: number;
  percentageOfTotal: number;
  dropOffCount: number;
  dropOffRatePercentage: number;
  avgDwellTimeHours: number;
  avgDwellTimeDays: number;
}

export interface FunnelAnalyticsResponse {
  totalLeadsInFunnel: number;
  stages: FunnelStageItem[];
}

// Token helper
export const TOKEN_STORAGE_KEY = 'foundx_crm_access_token';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

export const clearStoredToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

/**
 * Core fetch wrapper
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // for HTTP-only cookies
  });

  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new Error(`Server returned error status ${response.status}`);
    }
    data = {};
  }

  if (!response.ok) {
    let errorMessage = data?.message || 'Request failed';
    if (data?.errors) {
      if (Array.isArray(data.errors)) {
        errorMessage = data.errors.map((e: any) => e.message || String(e)).join(', ');
      } else if (typeof data.errors === 'object') {
        const details = Object.entries(data.errors)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');
        if (details) {
          errorMessage = `${errorMessage} (${details})`;
        }
      }
    }
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Authentication API
 */
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResult>> => {
    const res = await request<LoginResult>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.accessToken) {
      setStoredToken(res.data.accessToken);
    }
    return res;
  },

  getMe: async (): Promise<ApiResponse<UserProfile>> => {
    return request<UserProfile>('/v1/auth/me', {
      method: 'GET',
    });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const res = await request<void>('/v1/auth/logout', {
        method: 'POST',
      });
      clearStoredToken();
      return res;
    } catch (err) {
      clearStoredToken();
      throw err;
    }
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};

/**
 * Admin Leads API
 */
export const leadsApi = {
  getAdminLeads: async (params?: {
    view?: 'list' | 'kanban';
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    service?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<LeadItem[]>> => {
    const query = new URLSearchParams();
    if (params?.view) query.append('view', params.view);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.service) query.append('service', params.service);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<LeadItem[]>(`/v1/admin/leads${queryString}`, {
      method: 'GET',
    });
  },

  getLeadById: async (id: string): Promise<ApiResponse<LeadItem>> => {
    return request<LeadItem>(`/v1/admin/leads/${id}`, {
      method: 'GET',
    });
  },

  updateLeadStatus: async (
    id: string,
    status: string,
    boardOrder: number = 0,
    publicMessage?: string
  ): Promise<ApiResponse<LeadItem>> => {
    return request<LeadItem>(`/v1/admin/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        boardOrder,
        publicMessage,
      }),
    });
  },

  updateLeadDetails: async (
    id: string,
    details: {
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      name?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      service?: string;
      message?: string;
      status?: string;
    }
  ): Promise<ApiResponse<LeadItem>> => {
    return request<LeadItem>(`/v1/admin/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    });
  },

  deleteLead: async (id: string): Promise<ApiResponse<any>> => {
    return request<any>(`/v1/admin/leads/${id}`, {
      method: 'DELETE',
    });
  },

  createPublicLead: async (data: {
    name?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    service: string;
    message?: string;
    formData?: Record<string, any>;
  }): Promise<ApiResponse<any>> => {
    return request<any>('/v1/public/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Analytics API
 */
export const analyticsApi = {
  getOverview: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<OverviewKpi>> => {
    const q = new URLSearchParams();
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<OverviewKpi>(`/v1/admin/analytics/overview${queryString}`, {
      method: 'GET',
    });
  },

  getMonthlyTrends: async (params?: {
    year?: number;
    service?: string;
    status?: string;
  }): Promise<ApiResponse<MonthlyTrendsResponse>> => {
    const q = new URLSearchParams();
    if (params?.year) q.append('year', String(params.year));
    if (params?.service) q.append('service', params.service);
    if (params?.status) q.append('status', params.status);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<MonthlyTrendsResponse>(`/v1/admin/analytics/monthly-trends${queryString}`, {
      method: 'GET',
    });
  },

  getServiceAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ServiceAnalyticsResponse>> => {
    const q = new URLSearchParams();
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<ServiceAnalyticsResponse>(`/v1/admin/analytics/services${queryString}`, {
      method: 'GET',
    });
  },

  getFunnelAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    service?: string;
  }): Promise<ApiResponse<FunnelAnalyticsResponse>> => {
    const q = new URLSearchParams();
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    if (params?.service) q.append('service', params.service);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<FunnelAnalyticsResponse>(`/v1/admin/analytics/funnel${queryString}`, {
      method: 'GET',
    });
  },
};
