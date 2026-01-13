export interface ApiPod {
  _id: string;
  name: string;
  members: number;
  goals: number;
  isPod: boolean;
  crew: string;
  category: string;
  imageUrl: string;
}

export interface ApiResponse<T = ApiPod[]> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Pod {
  id: string;
  name: string;
  location: string;
  stage: string;
  members: number;
  status: 'active' | 'inactive';
  crew: string;
  image?: string;
}

export interface Crew {
  id: string;
  name: string;
  avatar: any;
  pods: Pod[];
}

// Unlock content types from API
export interface UnlockItem {
  _id: string;
  name: string;
  subtitle: string;
  desc: string;
  category: string;
  tabName: 'bmps' | 'culture' | 'marketing' | 'strategicPartners' | 'partnerRelations' | 'services';
  itemId: string;
  department_id: string;
}

export interface UnlocksByTab {
  bmps: UnlockItem[];
  culture: UnlockItem[];
  marketing: UnlockItem[];
  strategicPartners: UnlockItem[];
  partnerRelations: UnlockItem[];
  services: UnlockItem[];
}

// Pod Details Types
export interface BMP {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  status: 'active' | 'ready' | 'locked';
  category: 'leadership' | 'execution' | 'visibility';
}

export interface CultureItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  status: 'active' | 'ready' | 'locked';
}

export interface CultureSection {
  id: string;
  title: string;
  items: CultureItem[];
}

export interface CultureData {
  sections: CultureSection[];
}

export interface SimpleItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  status: 'active' | 'ready' | 'locked';
}

export interface SimpleTabData {
  items: SimpleItem[];
}

export interface SectionedTabData {
  sections: CultureSection[];
}

export interface PodDetailsResponse {
  _id: string;
  podId: string;
  name: string;
  crew: string;
  bmps: BMP[];
  culture: CultureData;
  marketing: SectionedTabData;
  strategicPartners: SectionedTabData;
  partnerRelations: SectionedTabData;
  services: SectionedTabData;
  tabs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CollegeResponse {
  _id: string;
  name: string;
  members: number;
  goals: number;
  isPod: boolean;
  crew: string;
  podCreationDate?: Date;
  podLevel?: number;
  category: string;
  imageUrl: string;
  podDetails?: {
    bmps?: BMP[];
    culture?: CultureData;
    marketing?: SectionedTabData;
    strategicPartners?: SectionedTabData;
    partnerRelations?: SectionedTabData;
    services?: SectionedTabData;
    tabs?: string[];
  };
  unlocks?: {
    unlockedBmps: string[];
    unlockedCulture: string[];
    unlockedMarketing: string[];
    unlockedStrategicPartners: string[];
    unlockedPartnerRelations: string[];
    unlockedServices: string[];
  };
}

// Unlock progress types
export interface Asset {
  _id: string;
  title: string;
  desc: string;
  unlock_id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Deliverable {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface PodUnlockProgress {
  unlockId: string;
  stageId: string;
  deliverables: Deliverable[];
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  _id: string;
  name: string;
  unlocks: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Unlock {
  _id: string;
  name: string;
  subtitle: string;
  desc: string;
  category: string;
  department_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageWithUnlocks extends Stage {
  unlocksData: Unlock[];
}