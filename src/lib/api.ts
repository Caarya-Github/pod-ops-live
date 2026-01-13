import { ApiResponse, ApiPod, Pod, PodDetailsResponse, CollegeResponse, UnlocksByTab, PodUnlockProgress, Stage, Unlock, Asset } from './types';
import { loadUnlockContent, mergePodDataWithUnlocks, mergePodDataWithProgress } from './dataLoader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PodUnlocksResponse {
  unlockedBmps: string[];
  unlockedCulture: string[];
  unlockedMarketing: string[];
  unlockedStrategicPartners: string[];
  unlockedPartnerRelations: string[];
  unlockedServices: string[];
}

/**
 * Fetch all unlock content grouped by tab from the API
 */
export async function fetchUnlocksByTab(): Promise<UnlocksByTab> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/unlocks/by-tab`);

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
    const response = await fetch(`${API_BASE_URL}/pods`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<ApiPod[]> = await response.json();

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
    const response = await fetch(`${API_BASE_URL}/pods/${podId}?includeDetails=true`);

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
    let progress: PodUnlockProgress[] = [];
    try {
      progress = await fetchUnlockProgress(podId);
      console.log('Fetched unlock progress:', progress);
    } catch (e) {
      console.warn('Could not fetch unlock progress, using empty progress', e);
    }

    // If we have progress data, use the new merge function
    // Otherwise fall back to the old unlock system
    let mergedData;
    if (progress.length > 0) {
      mergedData = mergePodDataWithProgress(unlockContent, progress);
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
 * Fetch unlock states for a specific pod
 */
export async function fetchPodUnlocks(podId: string): Promise<PodUnlocksResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlocks`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodUnlocksResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching pod unlocks:', error);
    throw error;
  }
}

/**
 * Unlock specific items in a pod
 */
export async function unlockPodItems(
  podId: string,
  items: Array<{ tabName: string; itemId: string; status: string }>
): Promise<PodUnlocksResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodUnlocksResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error unlocking pod items:', error);
    throw error;
  }
}

/**
 * Lock specific items in a pod
 */
export async function lockPodItems(
  podId: string,
  items: Array<{ tabName: string; itemId: string }>
): Promise<PodUnlocksResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/lock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodUnlocksResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error locking pod items:', error);
    throw error;
  }
}

/**
 * Fetch unlock progress for a specific pod (new system)
 */
export async function fetchUnlockProgress(podId: string): Promise<PodUnlockProgress[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlock-progress`);

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodUnlockProgress[]> = await response.json();

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
 * Toggle unlock status for a specific unlock (new system)
 */
export async function toggleUnlockStatus(podId: string, unlockId: string): Promise<PodUnlockProgress> {
  try {
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlocks/${unlockId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodUnlockProgress> = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error) {
    console.error('Error toggling unlock status:', error);
    throw error;
  }
}

/**
 * Fetch all stages
 */
export async function fetchStages(): Promise<Stage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stages`);

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
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/unlocks${query}`);

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
    const response = await fetch(`${API_BASE_URL}/admin/assets/unlock/${unlockId}`);

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
 * Start activation for an unlock (pending -> in-progress)
 */
export async function startUnlockActivation(podId: string, unlockId: string): Promise<PodUnlockProgress> {
  try {
    const response = await fetch(`${API_BASE_URL}/pods/${podId}/unlocks/${unlockId}/start-activation`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PodUnlockProgress> = await response.json();

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
 * Fetch all assets
 */
export async function fetchAllAssets(): Promise<Asset[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/assets`);

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