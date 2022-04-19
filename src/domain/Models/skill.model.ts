import { Model } from 'sequelize-typescript';

export class Skill extends Model {
  id: string;
  name: string;
  rating: number;
  slug: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
