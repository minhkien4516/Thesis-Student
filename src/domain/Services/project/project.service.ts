import { DatabaseError } from 'sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import {
  AddNewProjectDto,
  AddNewTechnologiesDto,
} from './dtos/addNewProject.dto';
import { Project } from '../../Models/project.model';
import {
  AddProjectTechnologyDto,
  AddResumeProjectDto,
} from './dtos/addResumeProject.dto';
import {
  UpdateProjectDto,
  UpdateTechnologyDto,
} from './dtos/updateProject.dto';
import { Technology } from '../../Models/technology.model';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger('ProjectService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewProject(
    addNewProjectDto: AddNewProjectDto,
  ): Promise<Project> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddNewProjects @projectName=:projectName, @startDate=:startDate, @endDate=:endDate' +
          ', @teamSize=:teamSize, @role=:role, @responsibilities=:responsibilities, @sourceLink=:sourceLink' +
          ', @description=:description',
        {
          type: QueryTypes.SELECT,
          replacements: {
            projectName: addNewProjectDto.projectName,
            startDate: addNewProjectDto.startDate,
            endDate: addNewProjectDto.endDate,
            teamSize: addNewProjectDto.teamSize,
            role: addNewProjectDto.role,
            responsibilities: addNewProjectDto.responsibilities,
            sourceLink: addNewProjectDto.sourceLink,
            description: addNewProjectDto.description,
          },
          raw: true,
          mapToModel: true,
          model: Project,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async addNewTechnology(
    addNewTechnologiesDto: AddNewTechnologiesDto,
  ): Promise<Technology> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddNewTechnologies  @title=:title, @content=:content',
        {
          type: QueryTypes.SELECT,
          replacements: {
            title: addNewTechnologiesDto.title,
            content: addNewTechnologiesDto.content,
          },
          raw: true,
          mapToModel: true,
          model: Technology,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async addResumeProject(
    addResumeProjectDto: AddResumeProjectDto,
  ): Promise<any> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddResumeProject @cvId=:cvId,@projectId=:projectId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...addResumeProjectDto,
          },
          raw: true,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async addProjectTechnology(
    addProjectTechnologyDto: AddProjectTechnologyDto,
  ): Promise<any> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddProjectTechnology @projectId=:projectId,@technologyId=:technologyId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...addProjectTechnologyDto,
          },
          raw: true,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async UpdateProject(id: string, updateProjectDto?: UpdateProjectDto) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateProject @id=:id,@projectName=:projectName, @startDate=:startDate, @endDate=:endDate' +
          ', @teamSize=:teamSize, @role=:role, @responsibilities=:responsibilities, @sourceLink=:sourceLink' +
          ', @description=:description',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            projectName: updateProjectDto.projectName ?? null,
            startDate: updateProjectDto.startDate ?? null,
            endDate: updateProjectDto.endDate ?? null,
            teamSize: updateProjectDto.teamSize ?? null,
            role: updateProjectDto.role ?? null,
            responsibilities: updateProjectDto.responsibilities ?? null,
            sourceLink: updateProjectDto.sourceLink ?? null,
            description: updateProjectDto.description ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Project,
        },
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async UpdateTechnology(
    id: string,
    updateTechnologyDto?: UpdateTechnologyDto,
  ) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateTechnology @id=:id,@title=:title, @content=:content',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            title: updateTechnologyDto.title ?? null,
            content: updateTechnologyDto.content ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Technology,
        },
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
