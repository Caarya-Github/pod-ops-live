import { UnlocksByTab, BMP, CultureData, SectionedTabData, PodUnlockProgress } from './types';
import { fetchUnlocksByTab } from './api';

// Parsed data cache
let cachedData: UnlocksByTab | null = null;

/**
 * Load unlock content from the API
 */
export async function loadUnlockContent(): Promise<UnlocksByTab> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await fetchUnlocksByTab();
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

  // Merge Marketing items with unlock states
  const marketingWithStatus: SectionedTabData = {
    sections: unlockContent.marketing.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.marketing.map(item => ({
          id: item.itemId,
          title: item.name,
          subtitle: item.subtitle,
          description: item.desc,
          status: unlocks.unlockedMarketing.includes(item.itemId) ? 'active' as const : 'locked' as const
        }))
      }
    ] : []
  };

  // Merge Strategic Partners with unlock states
  const strategicPartnersWithStatus: SectionedTabData = {
    sections: unlockContent.strategicPartners.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.strategicPartners.map(item => ({
          id: item.itemId,
          title: item.name,
          subtitle: item.subtitle,
          description: item.desc,
          status: unlocks.unlockedStrategicPartners.includes(item.itemId) ? 'active' as const : 'locked' as const
        }))
      }
    ] : []
  };

  // Merge Partner Relations with unlock states
  const partnerRelationsWithStatus: SectionedTabData = {
    sections: unlockContent.partnerRelations.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.partnerRelations.map(item => ({
          id: item.itemId,
          title: item.name,
          subtitle: item.subtitle,
          description: item.desc,
          status: unlocks.unlockedPartnerRelations.includes(item.itemId) ? 'active' as const : 'locked' as const
        }))
      }
    ] : []
  };

  // Merge Services with unlock states
  const servicesWithStatus: SectionedTabData = {
    sections: unlockContent.services.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.services.map(item => ({
          id: item.itemId,
          title: item.name,
          subtitle: item.subtitle,
          description: item.desc,
          status: unlocks.unlockedServices.includes(item.itemId) ? 'active' as const : 'locked' as const
        }))
      }
    ] : []
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

/**
 * Get status from progress - maps progress status to card status
 * 'completed' -> active card (ready to use, shows gradient button)
 * 'in-progress' -> ready card (ready to activate)
 * 'pending' -> locked card
 */
function getStatusFromProgress(progress: PodUnlockProgress | undefined): 'active' | 'ready' | 'locked' {
  if (!progress) return 'locked';
  return progress.status === 'completed' ? 'active' : progress.status === 'in-progress' ? 'ready' : 'locked';
}

/**
 * Merge unlock content with unlock progress (new system)
 */
export function mergePodDataWithProgress(
  unlockContent: UnlocksByTab,
  progress: PodUnlockProgress[]
) {
  console.log('=== DEBUG mergePodDataWithProgress ===');
  // Log each BMP's _id and itemId separately for debugging
  unlockContent.bmps.forEach((b, i) => {
    console.log(`BMP[${i}]: _id="${b._id}", itemId="${b.itemId}", name="${b.name}"`);
  });
  console.log('progress:', JSON.stringify(progress.map(p => ({ unlockId: p.unlockId, status: p.status }))));

  // Create a map of unlockId -> progress
  const progressMap = new Map<string, PodUnlockProgress>();
  progress.forEach(p => progressMap.set(p.unlockId, p));
  console.log('progressMap keys:', Array.from(progressMap.keys()));

  // Merge BMPs with progress status - match by _id first, fallback to itemId
  const bmpsWithStatus: BMP[] = unlockContent.bmps.map((item) => {
    // Try to find progress by _id first (most reliable), then by itemId
    let itemProgress = progressMap.get(item._id);
    if (!itemProgress) {
      itemProgress = progressMap.get(item.itemId);
    }
    const status = item.itemId === 'kickoff-caarya' ? 'active' as const : getStatusFromProgress(itemProgress);
    console.log(`BMP ${item.name} (itemId: "${item.itemId}", _id: "${item._id}"): progress=${itemProgress?.status || 'none'} -> cardStatus=${status}`);
    return {
      id: item._id,
      title: item.name,
      subtitle: item.subtitle,
      description: item.desc,
      status,
      category: mapCategory(item.category)
    };
  });

  // Merge Culture items with progress status
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
          let itemProgress = progressMap.get(item._id);
          if (!itemProgress) {
            itemProgress = progressMap.get(item.itemId);
          }
          return {
            id: item._id,
            title: item.name,
            subtitle: item.subtitle,
            description: item.desc,
            status: getStatusFromProgress(itemProgress)
          };
        })
    }))
  };

  // Merge Marketing items with progress status
  const marketingWithStatus: SectionedTabData = {
    sections: unlockContent.marketing.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.marketing.map(item => {
          let itemProgress = progressMap.get(item._id);
          if (!itemProgress) {
            itemProgress = progressMap.get(item.itemId);
          }
          return {
            id: item._id,
            title: item.name,
            subtitle: item.subtitle,
            description: item.desc,
            status: getStatusFromProgress(itemProgress)
          };
        })
      }
    ] : []
  };

  // Merge Strategic Partners with progress status
  const strategicPartnersWithStatus: SectionedTabData = {
    sections: unlockContent.strategicPartners.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.strategicPartners.map(item => {
          let itemProgress = progressMap.get(item._id);
          if (!itemProgress) {
            itemProgress = progressMap.get(item.itemId);
          }
          return {
            id: item._id,
            title: item.name,
            subtitle: item.subtitle,
            description: item.desc,
            status: getStatusFromProgress(itemProgress)
          };
        })
      }
    ] : []
  };

  // Merge Partner Relations with progress status
  const partnerRelationsWithStatus: SectionedTabData = {
    sections: unlockContent.partnerRelations.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.partnerRelations.map(item => {
          let itemProgress = progressMap.get(item._id);
          if (!itemProgress) {
            itemProgress = progressMap.get(item.itemId);
          }
          return {
            id: item._id,
            title: item.name,
            subtitle: item.subtitle,
            description: item.desc,
            status: getStatusFromProgress(itemProgress)
          };
        })
      }
    ] : []
  };

  // Merge Services with progress status
  const servicesWithStatus: SectionedTabData = {
    sections: unlockContent.services.length > 0 ? [
      {
        id: 'general',
        title: 'General',
        items: unlockContent.services.map(item => {
          let itemProgress = progressMap.get(item._id);
          if (!itemProgress) {
            itemProgress = progressMap.get(item.itemId);
          }
          return {
            id: item._id,
            title: item.name,
            subtitle: item.subtitle,
            description: item.desc,
            status: getStatusFromProgress(itemProgress)
          };
        })
      }
    ] : []
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
