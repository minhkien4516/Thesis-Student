import { Model } from 'sequelize-typescript';

export class Student extends Model {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  birthDate: string;
  identityNumber: string;
  class: string;
  term: string;
  status: string;
  academicYear: string;
  slug: string;
  address: string;
  phoneNumber: string;
  nameTeacher: string;
  specialization: string;
  internshipCertification: string;
  internshipReport: string;
  internshipGrade: number;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
