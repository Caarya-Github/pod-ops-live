import { ApiResponse, ApiPod, Pod, PodDetailsResponse, CollegeResponse } from './types';
import { loadPodData, mergePodDataWithUnlocks } from './dataLoader';

const API_BASE_URL = 'https://moksha-be-940979680786.europe-west2.run.app/api';

export interface PodUnlocksResponse {
  unlockedBmps: string[];
  unlockedCulture: string[];
  unlockedMarketing: string[];
  unlockedStrategicPartners: string[];
  unlockedPartnerRelations: string[];
  unlockedServices: string[];
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
    // Fetch unlock states from API
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

    // Load YAML pod data
    const podData = await loadPodData();

    // Get unlock states from API response
    const unlocks = data.data.unlocks || {
      unlockedBmps: [],
      unlockedCulture: [],
      unlockedMarketing: [],
      unlockedStrategicPartners: [],
      unlockedPartnerRelations: [],
      unlockedServices: [],
    };

    // Merge YAML data with unlock states
    const mergedData = mergePodDataWithUnlocks(podData, unlocks);

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