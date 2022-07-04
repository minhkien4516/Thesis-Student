export interface StudentsFilter {
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
  nameTeacher?: string;
  internshipCertification?: string;
  internshipReport?: string;
  internshipGrade?: string;
  details?: StudentDetail[];
}

export interface StudentFilter {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
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
  nameTeacher?: string;
  internshipCertification?: string;
  internshipReport?: string;
  internshipGrade?: string;
  cv?: [
    {
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
      contact?: Array<{
        id: string;
        title: string;
        content: number;
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
    },
  ];
  teacher?: [
    {
      teacherId?: string;
      lastName?: string;
      firstName?: string;
      fullName?: string;
      email?: string;
      department?: string;
      position?: string;
      phoneNumber?: string;
      studentAmount?: number;
      maximumStudentAmount?: number;
      slug?: string;
    },
  ];
  detail?: [
    {
      studentId?: string;
      teacherId?: string;
      isRegistered?: boolean;
      isAccepted?: boolean;
    },
  ];
}
export interface StudentsFilterResponse {
  data: StudentsFilter[];
  pagination?;
}

export interface StudentFilterResponse {
  data: StudentsFilter;
}

export interface StudentDetail {
  // subject?: [
  //   {
  //     id?: string;
  //     name?: string;
  //     gpa?: number;
  //     slug?: string;
  //     isActive?: boolean;
  //     isRegistered?: string;
  //     createdAt?: string | Date;
  //     updatedAt?: string | Date;
  //   },
  // ];
  cv?: [
    {
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
      contact?: Array<{
        id: string;
        title: string;
        content: number;
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
    },
  ];
}
