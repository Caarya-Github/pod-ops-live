import { ApiResponse, ApiPod, Pod } from './types';

const API_BASE_URL = 'https://moksha-be-940979680786.europe-west2.run.app/api';

export async function fetchPods(): Promise<Pod[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pods`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

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