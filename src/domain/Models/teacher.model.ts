import { Model } from 'sequelize-typescript';

export class Teacher extends Model {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  position: string;
  department: string;
  slug: string;
  phoneNumber: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
