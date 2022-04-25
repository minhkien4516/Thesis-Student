import { AddNewStudentsByImportDto } from './addNewStudents.dtos';
import { PartialType } from '@nestjs/swagger';

export class UpdateStudentDto extends PartialType(AddNewStudentsByImportDto) {}
