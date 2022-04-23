import { Model } from 'sequelize-typescript';

export class Student extends Model {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date | string;
  email: string;
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
