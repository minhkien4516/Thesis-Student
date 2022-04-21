import { PartialType } from '@nestjs/swagger';
import { AddNewProjectDto, AddNewTechnologiesDto } from './addNewProject.dto';

export class UpdateProjectDto extends PartialType(AddNewProjectDto) {}

export class UpdateTechnologyDto extends PartialType(AddNewTechnologiesDto) {}
