import { ApiResponse, ApiPod, Pod, PodDetailsResponse, CollegeResponse, UnlocksByTab, PodUnlockProgressResponse, PodActivation, PodAssetStatus, Stage, Unlock, Asset } from './types';
import { loadUnlockContent, mergePodDataWithUnlocks, mergePodDataWithProgress } from './dataLoader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Flag to prevent multiple redirects in quick succession
let isRedirecting = false;

// Token error messages that indicate the user needs to re-authenticate
const TOKEN_ERROR_MESSAGES = [
  'token has expired',
  'token expired',
  'invalid token',
  'jwt expired',
  'jwt malformed',
  'authentication failed',
  'unauthorized',
  'no token provided',
];

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Helper to check if an error indicates token expiry/invalid
function isTokenError(status: number, errorMessage: string, errorCode?: string): boolean {
  if (status === 401) return true;
  if (errorCode === 'TOKEN_EXPIRED') return true;

  const lowerMessage = errorMessage.toLowerCase();
  return TOKEN_ERROR_MESSAGES.some(msg => lowerMessage.includes(msg));
}

// Helper to handle token expiration redirect
function handleTokenExpiration(): void {
  if (typeof window === 'undefined') return;
  if (isRedirecting) return;
  if (window.location.pathname.includes('/login')) return;

  isRedirecting = true;
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  window.location.href = '/login';
}

// Helper for authenticated fetch calls
async function authenticatedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...(options?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Check for authentication errors and redirect to login
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || '';
    const errorCode = errorData.code || '';

    // Check for token-related errors
    if (isTokenError(response.status, errorMessage, errorCode)) {
      handleTokenExpiration();
    }
    throw new Error(errorMessage || 'Authentication failed');
  }

  if (!response.ok) {
    // Also check error body for non-401 errors that might indicate token issues
    try {
      const clonedResponse = response.clone();
      const errorData = await clonedResponse.json();
      const errorMessage = errorData.message || errorData.error || '';
      const errorCode = errorData.code || '';

      if (isTokenError(response.status, errorMessage, errorCode)) {
        handleTokenExpiration();
        throw new Error(errorMessage || 'Token expired');
      }
    } catch {
      // If we can't parse the error, continue with original error
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch all unlock content grouped by tab from the API
 */
export async function fetchUnlocksByTab(): Promise<UnlocksByTab> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/unlocks/by-tab`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<UnlocksByTab> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching unlocks by tab:', error);
    throw error;
  }
}

export async function fetchPods(): Promise<Pod[]> {
  try {
    const data = await authenticatedFetch<ApiResponse<ApiPod[]>>(`${API_BASE_URL}/pods`);

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data.map((apiPod: ApiPod) => ({
      id: apiPod._id,
      name: apiPod.name,
      location: apiPod.name,
      stage: 'Stage 1',
      members: apiPod.members,
      status: 'active' as const,
      crew: apiPod.crew,
      image: apiPod.imageUrl || undefined
    }));
  } catch (error) {
    console.error('Error fetching pods:', error);
    throw error;
  }
}

export async function fetchPodDetails(podId: string): Promise<PodDetailsResponse | null> {
  try {
    // Fetch pod info from API
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pods/${podId}?includeDetails=true`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      return null;
    }

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Pod details not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<CollegeResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    // Load unlock content from API
    const unlockContent = await loadUnlockContent();

    // Try to get unlock progress from new endpoint
    let progress: PodUnlockProgressResponse | null = null;
    try {
      progress = await fetchUnlockProgress(podId);
      console.log('Fetched unlock progress:', progress);
    } catch (e) {
      console.warn('Could not fetch unlock progress, using empty progress', e);
    }

    // If we have progress data, use the new merge function
    // Otherwise fall back to the old unlock system
    let mergedData;
    if (progress && progress.activations.length > 0) {
      mergedData = mergePodDataWithProgress(unlockContent, progress.activations);
    } else {
      // Fall back to old unlock system
      const unlocks = data.data.unlocks || {
        unlockedBmps: [],
        unlockedCulture: [],
        unlockedMarketing: [],
        unlockedStrategicPartners: [],
        unlockedPartnerRelations: [],
        unlockedServices: [],
      };
      mergedData = mergePodDataWithUnlocks(unlockContent, unlocks);
    }

    return {
      _id: data.data._id,
      podId: data.data._id,
      name: data.data.name,
      crew: data.data.crew,
      bmps: mergedData.bmps,
      culture: mergedData.culture,
      marketing: mergedData.marketing,
      strategicPartners: mergedData.strategicPartners,
      partnerRelations: mergedData.partnerRelations,
      services: mergedData.services,
      tabs: ['Team Directory', 'BPMs', 'Culture', 'Marketing', 'Strategic Partners', 'Partner Relations', 'Services'],
      createdAt: '',
      updatedAt: ''
    };
  } catch (error) {
    console.error('Error fetching pod details:', error);
    throw error;
  }
}

/**
 * Fetch unlock progress for a specific pod (new simplified system)
 */
export async function fetchUnlockProgress(podId: string): Promise<PodUnlockProgressResponse> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlock-progress`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      if (response.status === 404) {
        return { activations: [], assetStatuses: [] };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodUnlockProgressResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching unlock progress:', error);
    throw error;
  }
}

/**
 * Start activation for an unlock (pending -> in-progress)
 */
export async function startUnlockActivation(podId: string, unlockId: string): Promise<PodActivation> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlocks/${unlockId}/start-activation`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({}),
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodActivation> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error starting unlock activation:', error);
    throw error;
  }
}

/**
 * Toggle activation status for a specific unlock
 */
export async function toggleActivationStatus(podId: string, unlockId: string): Promise<PodActivation> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlocks/${unlockId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({}),
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodActivation> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error toggling activation status:', error);
    throw error;
  }
}

/**
 * Fetch all stages
 */
export async function fetchStages(): Promise<Stage[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/stages`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Stage[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching stages:', error);
    throw error;
  }
}

/**
 * Fetch all unlocks
 */
export async function fetchUnlocks(departmentId?: string): Promise<Unlock[]> {
  try {
    const token = getAuthToken();
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/unlocks${query}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Unlock[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching unlocks:', error);
    throw error;
  }
}

/**
 * Fetch assets for a specific unlock
 */
export async function fetchUnlockAssets(unlockId: string): Promise<Asset[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/assets/unlock/${unlockId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Asset[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching unlock assets:', error);
    throw error;
  }
}

/**
 * Fetch assets for an unlock with their completion status
 */
export async function fetchUnlockAssetsWithStatus(podId: string, unlockId: string): Promise<PodAssetStatus[]> {
  try {
    console.log('[API] fetchUnlockAssetsWithStatus:', { podId, unlockId });
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlocks/${unlockId}/assets`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log('[API] Response status:', response.status);

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[API] 404 - No assets found');
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodAssetStatus[]> = await response.json();
    console.log('[API] Response data:', data);

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('[API] Error fetching unlock assets with status:', error);
    throw error;
  }
}

/**
 * Toggle asset completion status
 */
export async function toggleAssetCompletion(podId: string, assetId: string): Promise<PodAssetStatus> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/assets/${assetId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({}),
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodAssetStatus> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error toggling asset completion:', error);
    throw error;
  }
}

/**
 * Update asset comment
 */
export async function updateAssetComment(podId: string, assetId: string, comment: string): Promise<PodAssetStatus> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/assets/${assetId}/comment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ comment }),
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodAssetStatus> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error updating asset comment:', error);
    throw error;
  }
}

/**
 * Fetch all assets
 */
export async function fetchAllAssets(): Promise<Asset[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/assets`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Asset[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching all assets:', error);
    throw error;
  }
}

// Types for availability calendar
export interface MemberAvailability {
  userId: string;
  name: string;
  dates: Array<{
    date: string;
    available: boolean;
    hours: number;
  }>;
}

export interface AvailabilityCalendarData {
  startDate: string;
  endDate: string;
  members: MemberAvailability[];
}

export interface TeamMember {
  _id: string;
  name: string;
  goals: number;
  role: {
    _id: string;
    name: string;
    description?: string;
  } | null;
}

/**
 * Fetch member availability for a date range
 */
export async function fetchMembersAvailability(
  userIds: string[],
  startDate: string,
  endDate: string
): Promise<MemberAvailability[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/work-preferences/members-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ userIds, startDate, endDate }),
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<MemberAvailability[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching members availability:', error);
    throw error;
  }
}

/**
 * Fetch all members
 */
export async function fetchAllMembers(): Promise<TeamMember[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/members`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<TeamMember[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

/**
 * Fetch members for a specific pod using the admin members endpoint with college filter
 */
export async function fetchPodMembers(podId: string): Promise<TeamMember[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/members?college=${podId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Check for authentication errors and redirect to login
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<TeamMember[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching pod members:', error);
    throw error;
  }
}

// Keep old function signatures for backwards compatibility during transition
// These will be removed after full migration
export async function fetchPodUnlocks(): Promise<null> {
  return null;
}

export async function unlockPodItems(): Promise<null> {
  return null;
}

export async function lockPodItems(): Promise<null> {
  return null;
}

export async function toggleUnlockStatus(): Promise<PodActivation> {
  throw new Error('Use toggleActivationStatus instead');
}
