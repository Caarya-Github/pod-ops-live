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

export interface ApiResponse {
  success: boolean;
  data: ApiPod[];
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