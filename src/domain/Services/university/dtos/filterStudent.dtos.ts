import { IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';

export class FilterStudentDto {
  @IsOptional()
  @IsString()
  identityNumber?: string | null;

  @IsOptional()
  @IsString()
  term?: string | null;

  @IsOptional()
  @IsString()
  fullName?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;

  @IsOptional()
  @IsString()
  academicYear?: string | null;

  @IsOptional()
  @IsString()
  nameTeacher?: string | null;

  @IsOptional()
  @IsString()
  specialization?: string | null;
}
