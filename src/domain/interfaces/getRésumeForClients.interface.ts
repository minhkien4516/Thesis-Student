export interface RésumeFilter {
  id?: string;
  studentName?: string;
  position?: string;
  content?: string;
  slug?: string;
  images?: Array<{
    id: string;
    ownerId: string;
    url: string;
  }>;
}
export interface RésumeFilterResponse {
  data: RésumeFilter[];
  pagination?;
}
