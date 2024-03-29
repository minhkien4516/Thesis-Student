export interface TeachersFilter {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  position?: string;
  department?: string;
  slug?: string;
  phoneNumber?: string;
  studentAmount?: number;
  maximumStudentAmount?: number;
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
  teacher?: [
    {
      id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      position?: string;
      department?: string;
      slug?: string;
      phoneNumber?: string;
      studentAmount?: number;
      maximumStudentAmount?: number;
      isActive: boolean;
      isRegistered: boolean;
      createdAt: string;
      updatedAt: string;
    },
  ];
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
      nameTeacher?: string;
      specialization?: string;
      internshipCertification?: string;
      internshipReport?: string;
      internshipFeedback?: string;
      internshipSurvey?: string;
      internshipFirstGrade?: number;
      internshipSecondGrade?: number;
      internshipThirdGrade?: number;
      internshipFinalGrade?: number;
      isActive: boolean;
      isRegistered: boolean;
      createdAt: string;
      updatedAt: string;
    },
  ];
  studentWaitingAccepted?: [
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
      nameTeacher?: string;
      specialization?: string;
      internshipCertification?: string;
      internshipReport?: string;
      internshipFeedback?: string;
      internshipSurvey?: string;
      internshipFirstGrade?: number;
      internshipSecondGrade?: number;
      internshipThirdGrade?: number;
      internshipFinalGrade?: number;
      isActive: boolean;
      isRegistered: boolean;
      createdAt: string;
      updatedAt: string;
    },
  ];
}
