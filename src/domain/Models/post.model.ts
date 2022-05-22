import { Model } from 'sequelize-typescript';

export class Post extends Model {
  id: string;
  title: string;
  content: number;
  isPublished: string;
  authorId: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
