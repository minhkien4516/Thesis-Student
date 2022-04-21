import { Model } from 'sequelize-typescript';

export class Contact extends Model {
  id: string;
  title: string;
  content: number;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
