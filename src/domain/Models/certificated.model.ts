import { Model } from 'sequelize-typescript';

export class Certificated extends Model {
  id: string;
  name: string;
  issueDate: string;
  organizer: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
