// User Profile Types
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  college: {
    _id: string;
    name: string;
    crew: string;
    isPod: boolean;
  } | null;
  role: {
    _id: string;
    name: string;
    description?: string;
  } | null;
  rank: {
    _id: string;
    name: string;
  } | null;
  isActive: boolean;
  hasOnboarded: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: UserProfile;
  };
}

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
  status: "active" | "inactive";
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
  tabName:
    | "bmps"
    | "culture"
    | "marketing"
    | "strategicPartners"
    | "partnerRelations"
    | "services";
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
  status: "active" | "ready" | "locked";
  category: "leadership" | "execution" | "visibility";
}

export interface CultureItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  status: "active" | "ready" | "locked";
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
  status: "active" | "ready" | "locked";
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

// Unlock progress types - New simplified schema
export interface PodActivation {
  unlockId: string;
  status: "pending" | "in-progress" | "completed";
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PodAssetStatus {
  assetId: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PodUnlockProgressResponse {
  activations: PodActivation[];
  assetStatuses: PodAssetStatus[];
}

// Keep old types for backwards compatibility during transition
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
  status: "pending" | "in-progress" | "completed";
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

// Challenge Vault Types
export type ChallengeCategory = 'bmps' | 'culture' | 'marketing' | 'strategicPartners' | 'partnerRelations' | 'services';
export type ChallengePriority = 'low' | 'medium' | 'high' | 'critical';
export type ChallengeStatus = 'identified' | 'rca-in-progress' | 'rca-completed' | 'solution-in-progress' | 'resolved' | 'archived';
export type CoreProblemStatus = 'identified' | 'open-for-solutions' | 'solution-implementing' | 'resolved' | 'escalated';
export type SolutionStatus = 'submitted' | 'under-review' | 'accepted' | 'discarded' | 'implementing' | 'implemented';

export interface RootCauseStep {
  level: number;
  answer: string;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  podId: string;
  addedBy: {
    _id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  } | string;
  category: ChallengeCategory;
  priority: ChallengePriority;
  status: ChallengeStatus;
  dateIdentified: string;
  coreProblemId: {
    _id: string;
    title: string;
    status: string;
  } | string | null;
  creditsAwarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoreProblem {
  _id: string;
  title: string;
  description: string;
  podId: string;
  challenges: Array<{
    _id: string;
    title: string;
    status: string;
    category?: string;
    priority?: string;
  }>;
  rootCauseAnalysis: RootCauseStep[];
  status: CoreProblemStatus;
  assignedTo: {
    _id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  resolvedBySolutionId: string | null;
  winReflection: string | null;
  resolvedAt: string | null;
  isPublic: boolean;
  escalatedTo: {
    _id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  escalationNotes: string;
  outcomeNotes: string;
  isSolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Solution {
  _id: string;
  coreProblemId: string;
  submittedBy: {
    _id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  } | string;
  description: string;
  status: SolutionStatus;
  isSelected: boolean;
  reviewedBy: {
    _id: string;
    name: string;
    email?: string;
  } | null;
  reviewNotes: string;
  reviewedAt: string | null;
  outcome: string;
  outcomeDate: string | null;
  creditsAwarded: boolean;
  createdAt: string;
  updatedAt: string;
}
