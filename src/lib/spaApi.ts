// SPA API Client

import {
  StartupLead,
  POC,
  ScoringCriteria,
  ScoringMatrix,
  DashboardStats,
  CreateLeadDto,
  CreatePOCDto,
  HandoverDto,
} from './spa-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Try 'token' first (set by login), fallback to 'authToken'
  return localStorage.getItem('token') || localStorage.getItem('authToken');
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// ==================== STARTUP LEAD API ====================

export const leadApi = {
  // Get dashboard stats (uses authenticated user's ID from token)
  async getDashboardStats(): Promise<DashboardStats> {
    const result = await apiRequest<DashboardStats>('/spa/dashboard');
    return result.data!;
  },

  // Create a new lead
  async createLead(lead: CreateLeadDto): Promise<StartupLead> {
    const result = await apiRequest<StartupLead>('/spa/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
    return result.data!;
  },

  // Get all leads with filters (filtered by authenticated user by default)
  async getAllLeads(filters?: {
    currentStatus?: string;
    domain?: string;
    institution?: string;
    minScore?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<StartupLead[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await apiRequest<StartupLead[]>(`/spa/leads${query}`);
    return result.data!;
  },

  // Get a single lead
  async getLead(id: string): Promise<StartupLead> {
    const result = await apiRequest<StartupLead>(`/spa/leads/${id}`);
    return result.data!;
  },

  // Update a lead
  async updateLead(id: string, updates: Partial<StartupLead>): Promise<StartupLead> {
    const result = await apiRequest<StartupLead>(`/spa/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return result.data!;
  },

  // Delete a lead
  async deleteLead(id: string): Promise<void> {
    await apiRequest(`/spa/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Update lead status
  async updateLeadStatus(id: string, status: string): Promise<StartupLead> {
    const result = await apiRequest<StartupLead>(`/spa/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return result.data!;
  },

  // Score a lead
  async scoreLead(id: string, criteria: ScoringCriteria): Promise<ScoringMatrix> {
    const result = await apiRequest<ScoringMatrix>(`/spa/leads/${id}/score`, {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
    return result.data!;
  },

  // Handover lead to PRL
  async handoverLead(id: string, handoverData: HandoverDto): Promise<any> {
    const result = await apiRequest(`/spa/leads/${id}/handover`, {
      method: 'POST',
      body: JSON.stringify(handoverData),
    });
    return result.data!;
  },
};

// ==================== POC API ====================

export const pocApi = {
  // Create a new POC
  async createPOC(poc: CreatePOCDto): Promise<POC> {
    const result = await apiRequest<POC>('/spa/pocs', {
      method: 'POST',
      body: JSON.stringify(poc),
    });
    return result.data!;
  },

  // Get all POCs for a lead
  async getPOCsByLead(leadId: string): Promise<POC[]> {
    const result = await apiRequest<POC[]>(`/spa/leads/${leadId}/pocs`);
    return result.data!;
  },

  // Get a single POC
  async getPOC(id: string): Promise<POC> {
    const result = await apiRequest<POC>(`/spa/pocs/${id}`);
    return result.data!;
  },

  // Update a POC
  async updatePOC(id: string, updates: Partial<POC>): Promise<POC> {
    const result = await apiRequest<POC>(`/spa/pocs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return result.data!;
  },

  // Delete a POC
  async deletePOC(id: string): Promise<void> {
    await apiRequest(`/spa/pocs/${id}`, {
      method: 'DELETE',
    });
  },
};
