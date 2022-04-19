import { Model } from 'sequelize-typescript';

export class Résume extends Model {
  id: string;
  studentName: string;
  position: number;
  content: string;
  slug: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
