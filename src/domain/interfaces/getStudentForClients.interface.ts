export interface StudentsFilter {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  identityNumber?: string | null;
  class?: string | null;
  term?: string | null;
  status?: string | null;
  academicYear?: string | null;
  slug?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface StudentsFilterResponse {
  data: [StudentsFilter];
  pagination?;
}
