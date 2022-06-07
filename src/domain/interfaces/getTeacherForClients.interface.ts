export interface TeachersFilter {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  position?: string;
  department?: string;
  slug?: string;
  phoneNumber?: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
  details?: TeacherDetail[];
}
export interface TeachersFilterResponse {
  data: TeachersFilter[];
  pagination?;
}

export interface TeacherDetail {
  student?: [
    {
      id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      birthDate?: string;
      identityNumber?: string;
      class?: string;
      term?: string;
      status?: string;
      academicYear?: string;
      slug?: string;
      address?: string;
      phoneNumber?: string;
      isActive: boolean;
      isRegistered: boolean;
      createdAt: string;
      updatedAt: string;
    },
  ];
}