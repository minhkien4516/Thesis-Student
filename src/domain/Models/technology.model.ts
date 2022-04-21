import { Model } from 'sequelize-typescript';

export class Technology extends Model {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
