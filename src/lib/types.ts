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