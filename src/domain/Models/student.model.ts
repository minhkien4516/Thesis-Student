import { Model } from 'sequelize-typescript';

export class Student extends Model {
  id: number;
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
  isActive: boolean;
  isRegistered: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
