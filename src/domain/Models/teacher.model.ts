import { Model } from 'sequelize-typescript';

export class Teacher extends Model {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  position: string;
  department: string;
  slug: string;
  phoneNumber: string;
  studentAmount: number;
  maximumStudentAmount: number;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
