import { Model } from 'sequelize-typescript';

export class Project extends Model {
  id: string;
  projectName: string;
  startDate: Date | string;
  endDate: Date | string;
  teamSize: number;
  role: string;
  responsibilities: string;
  sourceLink: string;
  description: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
