import { AddNewTeachersByImportDto } from './addNewTeachers.dtos';
import { PartialType } from '@nestjs/swagger';

export class UpdateTeacherDto extends PartialType(AddNewTeachersByImportDto) {}
