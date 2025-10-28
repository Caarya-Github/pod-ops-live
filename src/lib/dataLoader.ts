import yaml from 'js-yaml';
import { BMP, CultureData, SimpleTabData, SectionedTabData } from './types';

// Parsed data cache
let cachedData: {
  bmps?: BMP[];
  culture?: CultureData;
  marketing?: SectionedTabData;
  strategicPartners?: SectionedTabData;
  partnerRelations?: SectionedTabData;
  services?: SectionedTabData;
} | null = null;

/**
 * Load and parse all YAML pod data files
 */
export async function loadPodData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    // Fetch and parse YAML files
    const [
      bmpsData,
      cultureData,
      marketingData,
      strategicPartnersData,
      partnerRelationsData,
      servicesData
    ] = await Promise.all([
      fetchYaml('/data/pods/bmps.yaml'),
      fetchYaml('/data/pods/culture.yaml'),
      fetchYaml('/data/pods/marketing.yaml'),
      fetchYaml('/data/pods/strategic-partners.yaml'),
      fetchYaml('/data/pods/partner-relations.yaml'),
      fetchYaml('/data/pods/services.yaml'),
    ]);

    cachedData = {
      bmps: bmpsData.bmps || [],
      culture: cultureData || { sections: [] },
      marketing: marketingData || { sections: [] },
      strategicPartners: strategicPartnersData || { sections: [] },
      partnerRelations: partnerRelationsData || { sections: [] },
      services: servicesData || { sections: [] },
    };

    return cachedData;
  } catch (error) {
    console.error('Error loading pod data:', error);
    throw error;
  }
}

/**
 * Fetch and parse a YAML file
 */
async function fetchYaml(path: string): Promise<any> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    const text = await response.text();
    return yaml.load(text);
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    throw error;
  }
}

/**
 * Merge pod data with unlock states
 */
export function mergePodDataWithUnlocks(
  podData: Awaited<ReturnType<typeof loadPodData>>,
  unlocks: {
    unlockedBmps: string[];
    unlockedCulture: string[];
    unlockedMarketing: string[];
    unlockedStrategicPartners: string[];
    unlockedPartnerRelations: string[];
    unlockedServices: string[];
  }
) {
  // Merge BMPs with unlock states
  const bmpsWithStatus = podData.bmps?.map((bmp) => ({
    ...bmp,
    status: unlocks.unlockedBmps.includes(bmp.id)
      ? (bmp.id === 'kickoff-caarya' ? 'active' as const : 'ready' as const)
      : 'locked' as const
  })) || [];

  // Merge Culture items with unlock states
  const cultureWithStatus: CultureData = {
    sections: podData.culture?.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: unlocks.unlockedCulture.includes(item.id) ? 'active' as const : 'locked' as const
      }))
    })) || []
  };

  // Merge Marketing items with unlock states
  const marketingWithStatus: SectionedTabData = {
    sections: podData.marketing?.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: unlocks.unlockedMarketing.includes(item.id) ? 'active' as const : 'locked' as const
      }))
    })) || []
  };

  // Merge Strategic Partners with unlock states
  const strategicPartnersWithStatus: SectionedTabData = {
    sections: podData.strategicPartners?.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: unlocks.unlockedStrategicPartners.includes(item.id) ? 'active' as const : 'locked' as const
      }))
    })) || []
  };

  // Merge Partner Relations with unlock states
  const partnerRelationsWithStatus: SectionedTabData = {
    sections: podData.partnerRelations?.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: unlocks.unlockedPartnerRelations.includes(item.id) ? 'active' as const : 'locked' as const
      }))
    })) || []
  };

  // Merge Services with unlock states
  const servicesWithStatus: SectionedTabData = {
    sections: podData.services?.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: unlocks.unlockedServices.includes(item.id) ? 'active' as const : 'locked' as const
      }))
    })) || []
  };

  return {
    bmps: bmpsWithStatus,
    culture: cultureWithStatus,
    marketing: marketingWithStatus,
    strategicPartners: strategicPartnersWithStatus,
    partnerRelations: partnerRelationsWithStatus,
    services: servicesWithStatus,
  };
}

/**
 * Clear cached data (useful for testing or forced refresh)
 */
export function clearCache() {
  cachedData = null;
}
