import { IsOptional, IsString } from 'class-validator';

export class AddNewStudentsByImportDto {
  @IsString()
  @IsOptional()
  firstName?: string | null;

  @IsString()
  @IsOptional()
  lastName?: string | null;

  @IsOptional()
  @IsString()
  fullName?: string | null;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsString()
  birthDate?: string | null;

  @IsOptional()
  @IsString()
  identityNumber?: string | null;

  @IsOptional()
  @IsString()
  class?: string | null;

  @IsOptional()
  @IsString()
  term?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;

  @IsOptional()
  @IsString()
  academicYear?: string | null;

  @IsOptional()
  @IsString()
  slug?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @IsOptional()
  @IsString()
  nameTeacher?: string | null;

  @IsOptional()
  @IsString()
  internshipCertification?: string | null;

  @IsOptional()
  @IsString()
  internshipReport?: string | null;
}

export class AddNewStudentsDto {
  students: [AddNewStudentsByImportDto];
}
