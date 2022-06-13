export interface RésumeFilter {
  id?: string;
  studentName?: string;
  position?: string;
  content?: string;
  slug?: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
  images?: Array<{
    id: string;
    ownerId: string;
    url: string;
  }>;
  details?: RésumeDetail;
}

export interface ResumeFilter {
  id?: string;
  studentName?: string;
  position?: string;
  content?: string;
  slug?: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
  images?: Array<{
    id: string;
    ownerId: string;
    url: string;
  }>;
  details?: ResumeDetail;
}
export interface RésumeFilterResponse {
  data?: RésumeFilter[];
  pagination?;
}

export interface ResumeFilterResponse {
  data?: ResumeFilter[];
}

export interface ResumeFilterRequest {
  id?: string;
  cvId?: string;
}

export interface RésumeDetail {
  contact?: Array<{
    id: string;
    title: string;
    content: number;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  certificated?: Array<{
    id: string;
    name: string;
    issueDate: Date | string;
    organizer: string;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  skill?: Array<{
    id: string;
    name: string;
    rating: number;
    slug: string;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  project?: Array<{
    id: string;
    projectName: string;
    startDate: Date | string;
    endDate: Date | string;
    teamSize: number;
    role: string;
    responsibilities: string;
    sourceLink: string;
    description: string;
    technology?: Array<{
      id: string;
      title: string;
      content: number;
      isActive: boolean;
      isRegistered: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ResumeDetail {
  contact?: Array<{
    id: string;
    title: string;
    content: number;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  certificated?: Array<{
    id: string;
    name: string;
    issueDate: Date | string;
    organizer: string;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  skill?: Array<{
    id: string;
    name: string;
    rating: number;
    slug: string;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  project?: Array<{
    id: string;
    projectName: string;
    startDate: Date | string;
    endDate: Date | string;
    teamSize: number;
    role: string;
    responsibilities: string;
    sourceLink: string;
    description: string;
    technology?: Array<{
      id: string;
      title: string;
      content: number;
      isActive: boolean;
      isRegistered: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    isActive: boolean;
    isRegistered: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
