import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddNewTeachersByImportDto {
  @IsString()
  @IsOptional()
  firstName?: string | null;

  @IsString()
  @IsOptional()
  lastName?: string | null;

  @IsString()
  @IsOptional()
  fullName?: string | null;

  @IsString()
  @IsOptional()
  email?: string | null;

  @IsString()
  @IsOptional()
  position?: string | null;

  @IsString()
  @IsOptional()
  department?: string | null;

  @IsString()
  @IsOptional()
  slug?: string | null;

  @IsNumber()
  @IsOptional()
  studentAmount?: number | null;

  @IsNumber()
  @IsOptional()
  maximumStudentAmount?: number | null;

  @IsString()
  @IsOptional()
  academicYear?: string | null;

  @IsString()
  @IsOptional()
  phoneNumber?: string | null;
}

export class AddNewTeachersDto {
  teachers: [AddNewTeachersByImportDto];
}
