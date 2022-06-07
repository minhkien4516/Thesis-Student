export interface SaveStudentAccountForOwnerRequest {
  students: Array<{
    email?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    role?: string | null;
  }>;
}