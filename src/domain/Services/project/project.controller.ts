import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AddNewProjectsDto } from './dtos/addNewProject.dto';
import {
  UpdateProjectDto,
  UpdateTechnologyDto,
} from './dtos/updateProject.dto';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  private readonly logger = new Logger('ProjectController');

  constructor(private projectService: ProjectService) {}

  @Post()
  async addNewResumeProject(
    @Query('cvId') cvId: string,
    @Body() addNewProjectsDto: AddNewProjectsDto,
  ) {
    try {
      const multiProject = await Promise.all(
        addNewProjectsDto.project.map(async (item) => {
          const Project = await this.projectService.addNewProject(item);
          console.log(Project);
          await this.projectService.addResumeProject({
            projectId: Project.id,
            cvId,
          });
          if (item.technology.length < 0) return [];
          item.technology.map(async (tech) => {
            const technologies = await this.projectService.addNewTechnology(
              tech,
            );
            await this.projectService.addProjectTechnology({
              projectId: Project.id,
              technologyId: technologies.id,
            });
          });
          return item;
        }),
      );

      return multiProject;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch()
  public async updateProject(
    @Query('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      const result = await this.projectService.UpdateProject(
        id,
        updateProjectDto,
      );
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('technology')
  public async updateTechnology(
    @Query('id') id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
  ) {
    try {
      const result = await this.projectService.UpdateTechnology(
        id,
        updateTechnologyDto,
      );
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
