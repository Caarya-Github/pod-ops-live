// SPA Feature Types

export type StartupStage = 'Idea' | 'MVP' | 'Beta' | 'Launched' | 'MarketTraction';
export type ActivityLevel = 'Dormant' | 'Occasional' | 'Active' | 'Consistent';
export type LeadSource = 'E-cell' | 'Incubator' | 'Referral' | 'SocialMedia' | 'Other';
export type Domain = 'EdTech' | 'FinTech' | 'HealthTech' | 'AgriTech' | 'E-Commerce' | 'SaaS' | 'Other';
export type LeadStatus = 'ResearchPending' | 'Verified' | 'Qualified' | 'ReadyForOutreach';
export type POCRole = 'Founder' | 'CoFounder' | 'Marketing' | 'TechLead' | 'Other';

export interface StartupLead {
  _id: string;
  startupName: string;
  description: string;
  institution: string;
  domain: Domain;
  startupStage: StartupStage;
  websiteOrSocialLink?: string;
  source: LeadSource;
  activityLevel: ActivityLevel;
  serviceFit: string[];
  leadScore: number;
  currentStatus: LeadStatus;
  spaOwner: string;
  prlAssigned?: string;
  proofLinks: string[];
  createdAt: string;
  updatedAt: string;
  pocCount?: number;
}

export interface POC {
  _id: string;
  leadId: string;
  name: string;
  role: POCRole;
  email?: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoringCriteria {
  domainScore: number;
  engagementScore: number;
  storyPotentialScore: number;
}

export interface ScoringMatrix {
  _id: string;
  leadId: string;
  stageScore: number;
  activityScore: number;
  domainScore: number;
  engagementScore: number;
  storyPotentialScore: number;
  weightedTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  researchPending: number;
  verified: number;
  qualified: number;
  readyForOutreach: number;
  totalLeads: number;
  averageScore: number;
}

export interface CreateLeadDto {
  startupName: string;
  description?: string;
  institution: string;
  domain: Domain;
  startupStage: StartupStage;
  websiteOrSocialLink?: string;
  source: LeadSource;
  activityLevel: ActivityLevel;
  serviceFit?: string[];
  proofLinks?: string[];
}

export interface CreatePOCDto {
  leadId: string;
  name: string;
  role: POCRole;
  email?: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
}

export interface HandoverDto {
  prlReceiverId: string;
  notes?: string;
  attachments?: string[];
}

// UI View Types
export type ViewMode = 'table' | 'kanban';

// Score mapping constants
export const STAGE_SCORES: Record<StartupStage, number> = {
  Idea: 10,
  MVP: 25,
  Beta: 50,
  Launched: 75,
  MarketTraction: 100,
};

export const ACTIVITY_SCORES: Record<ActivityLevel, number> = {
  Dormant: 10,
  Occasional: 40,
  Active: 70,
  Consistent: 100,
};

export const SCORE_OPTIONS = [
  { value: 25, label: 'Low (25)' },
  { value: 50, label: 'Medium (50)' },
  { value: 100, label: 'High (100)' },
];

export const SERVICE_FIT_OPTIONS = [
  '360° Testing',
  'Creator Pool',
  'Founder Dialogue',
  'Market Research',
  'Product Development',
];
