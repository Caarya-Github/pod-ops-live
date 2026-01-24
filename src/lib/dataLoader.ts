import { UnlocksByTab, BMP, CultureData, SectionedTabData, PodActivation } from './types';
import { fetchUnlocksByTab } from './api';

// Parsed data cache
let cachedData: UnlocksByTab | null = null;

/**
 * Load unlock content from the API
 */
export async function loadUnlockContent(): Promise<UnlocksByTab> {
  if (cachedData) {
    console.log('[DataLoader] Using cached unlock content');
    return cachedData;
  }

  try {
    const data = await fetchUnlocksByTab();
    console.log('[DataLoader] Fetched unlock content:', {
      bmps: data.bmps.length,
      culture: data.culture.length,
      marketing: data.marketing.length,
      marketingCategories: [...new Set(data.marketing.map(m => m.category || 'undefined'))],
      strategicPartners: data.strategicPartners.length,
      partnerRelations: data.partnerRelations.length,
      services: data.services.length,
    });
    cachedData = data;
    return cachedData;
  } catch (error) {
    console.error('Error loading unlock content:', error);
    throw error;
  }
}

/**
 * Transform unlock items to BMP format
 */
function transformToBMPs(items: UnlocksByTab['bmps']): BMP[] {
  return items.map(item => ({
    id: item.itemId,
    title: item.name,
    subtitle: item.subtitle,
    description: item.desc,
    status: 'locked' as const,
    category: mapCategory(item.category)
  }));
}

/**
 * Transform unlock items to Culture format
 * Groups items by category into sections
 */
function transformToCulture(items: UnlocksByTab['culture']): CultureData {
  // Group items by category
  const categoryGroups = items.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      id: item.itemId,
      title: item.name,
      subtitle: item.subtitle,
      description: item.desc,
      status: 'locked' as const
    });
    return acc;
  }, {} as Record<string, Array<{ id: string; title: string; subtitle?: string; description: string; status: 'active' | 'ready' | 'locked' }>>);

  // Convert to sections
  const sections = Object.entries(categoryGroups).map(([title, items]) => ({
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    items
  }));

  return { sections };
}

/**
 * Map category string to BMP category type
 */
function mapCategory(category: string): 'leadership' | 'execution' | 'visibility' {
  const cat = category.toLowerCase();
  if (cat.includes('leadership') || cat.includes('vision')) return 'leadership';
  if (cat.includes('execution') || cat.includes('operational')) return 'execution';
  if (cat.includes('visibility') || cat.includes('marketing')) return 'visibility';
  return 'execution'; // default
}

/**
 * Merge unlock content with unlock states
 */
export function mergePodDataWithUnlocks(
  unlockContent: UnlocksByTab,
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
  const bmpsWithStatus: BMP[] = unlockContent.bmps.map((item) => ({
    id: item.itemId,
    title: item.name,
    subtitle: item.subtitle,
    description: item.desc,
    status: unlocks.unlockedBmps.includes(item.itemId)
      ? (item.itemId === 'kickoff-caarya' ? 'active' as const : 'ready' as const)
      : 'locked' as const,
    category: mapCategory(item.category)
  }));

  // Merge Culture items with unlock states
  const cultureWithStatus: CultureData = {
    sections: unlockContent.culture.map(item => item.category || 'General').reduce((acc, category) => {
      if (!acc.find(s => s.title === category)) {
        acc.push({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          title: category,
          items: []
        });
      }
      return acc;
    }, [] as Array<{ id: string; title: string; items: Array<{ id: string; title: string; subtitle?: string; description: string; status: 'active' | 'ready' | 'locked' }> }>).map(section => ({
      ...section,
      items: unlockContent.culture
        .filter(item => (item.category || 'General') === section.title)
        .map(item => ({
          id: item.itemId,
          title: item.name,
          subtitle: item.subtitle,
          description: item.desc,
          status: unlocks.unlockedCulture.includes(item.itemId) ? 'active' as const : 'locked' as const
        }))
    }))
  };

  /**
   * Helper to group items by category into sections (for mergePodDataWithUnlocks)
   */
  function groupItemsByCategoryForUnlocks<T extends { itemId: string; name: string; subtitle?: string; desc: string; category?: string }>(
    items: T[],
    unlockedIds: string[]
  ): SectionedTabData {
    if (items.length === 0) return { sections: [] };

    // Group items by category
    const categoryGroups = items.reduce((acc, item) => {
      const category = item.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    // Convert to sections
    const sections = Object.entries(categoryGroups).map(([title, categoryItems]) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      items: categoryItems.map(item => ({
        id: item.itemId,
        title: item.name,
        subtitle: item.subtitle,
        description: item.desc,
        status: unlockedIds.includes(item.itemId) ? 'active' as const : 'locked' as const
      }))
    }));

    return { sections };
  }

  // Merge Marketing items with unlock states - group by category
  const marketingWithStatus = groupItemsByCategoryForUnlocks(unlockContent.marketing, unlocks.unlockedMarketing);

  // Merge Strategic Partners with unlock states - group by category
  const strategicPartnersWithStatus = groupItemsByCategoryForUnlocks(unlockContent.strategicPartners, unlocks.unlockedStrategicPartners);

  // Merge Partner Relations with unlock states - group by category
  const partnerRelationsWithStatus = groupItemsByCategoryForUnlocks(unlockContent.partnerRelations, unlocks.unlockedPartnerRelations);

  // Merge Services with unlock states - group by category
  const servicesWithStatus = groupItemsByCategoryForUnlocks(unlockContent.services, unlocks.unlockedServices);

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

/**
 * Get status from activation - maps activation status to card status
 * 'completed' -> active card (ready to use, shows gradient button)
 * 'in-progress' -> ready card (ready to activate)
 * 'pending' -> locked card
 */
function getStatusFromActivation(activation: PodActivation | undefined): 'active' | 'ready' | 'locked' {
  if (!activation) return 'locked';
  return activation.status === 'completed' ? 'active' : activation.status === 'in-progress' ? 'ready' : 'locked';
}

/**
 * Merge unlock content with unlock activations (new simplified system)
 */
export function mergePodDataWithProgress(
  unlockContent: UnlocksByTab,
  activations: PodActivation[]
) {
  // Create a map of unlockId -> activation
  const activationMap = new Map<string, PodActivation>();
  activations.forEach(a => activationMap.set(a.unlockId, a));

  // Merge BMPs with activation status - match by _id first, fallback to itemId
  const bmpsWithStatus: BMP[] = unlockContent.bmps.map((item) => {
    // Try to find activation by _id first (most reliable), then by itemId
    let itemActivation = activationMap.get(item._id);
    if (!itemActivation) {
      itemActivation = activationMap.get(item.itemId);
    }
    const status = item.itemId === 'kickoff-caarya' ? 'active' as const : getStatusFromActivation(itemActivation);
    return {
      id: item._id,
      title: item.name,
      subtitle: item.subtitle,
      description: item.desc,
      status,
      category: mapCategory(item.category)
    };
  });

  // Merge Culture items with activation status
  const cultureWithStatus: CultureData = {
    sections: unlockContent.culture.map(item => item.category || 'General').reduce((acc, category) => {
      if (!acc.find(s => s.title === category)) {
        acc.push({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          title: category,
          items: []
        });
      }
      return acc;
    }, [] as Array<{ id: string; title: string; items: Array<{ id: string; title: string; subtitle?: string; description: string; status: 'active' | 'ready' | 'locked' }> }>).map(section => ({
      ...section,
      items: unlockContent.culture
        .filter(item => (item.category || 'General') === section.title)
        .map(item => {
          let itemActivation = activationMap.get(item._id);
          if (!itemActivation) {
            itemActivation = activationMap.get(item.itemId);
          }
          return {
            id: item._id,
            title: item.name,
            subtitle: item.subtitle,
            description: item.desc,
            status: getStatusFromActivation(itemActivation)
          };
        })
    }))
  };

  /**
   * Helper to group items by category into sections (like culture does)
   */
  function groupItemsByCategory<T extends { _id: string; itemId: string; name: string; subtitle?: string; desc: string; category?: string }>(
    items: T[],
    activationMap: Map<string, PodActivation>
  ): SectionedTabData {
    if (items.length === 0) return { sections: [] };

    // Group items by category
    const categoryGroups = items.reduce((acc, item) => {
      const category = item.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    // Convert to sections
    const sections = Object.entries(categoryGroups).map(([title, categoryItems]) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      items: categoryItems.map(item => {
        let itemActivation = activationMap.get(item._id);
        if (!itemActivation) {
          itemActivation = activationMap.get(item.itemId);
        }
        return {
          id: item._id,
          title: item.name,
          subtitle: item.subtitle,
          description: item.desc,
          status: getStatusFromActivation(itemActivation)
        };
      })
    }));

    return { sections };
  }

  // Merge Marketing items with activation status - group by category
  const marketingWithStatus = groupItemsByCategory(unlockContent.marketing, activationMap);

  // Merge Strategic Partners with activation status - group by category
  const strategicPartnersWithStatus = groupItemsByCategory(unlockContent.strategicPartners, activationMap);

  // Merge Partner Relations with activation status - group by category
  const partnerRelationsWithStatus = groupItemsByCategory(unlockContent.partnerRelations, activationMap);

  // Merge Services with activation status - group by category
  const servicesWithStatus = groupItemsByCategory(unlockContent.services, activationMap);

  return {
    bmps: bmpsWithStatus,
    culture: cultureWithStatus,
    marketing: marketingWithStatus,
    strategicPartners: strategicPartnersWithStatus,
    partnerRelations: partnerRelationsWithStatus,
    services: servicesWithStatus,
  };
}
