import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddNewStudentsByImportDto {
  @IsString()
  @IsNotEmpty()
  firstName?: string | null;

  @IsString()
  @IsNotEmpty()
  lastName?: string | null;

  @IsString()
  @IsNotEmpty()
  email?: string | null;

  @IsString()
  @IsNotEmpty()
  birthDate?: string | null;

  @IsString()
  @IsNotEmpty()
  identityNumber?: string | null;

  @IsString()
  @IsNotEmpty()
  class?: string | null;

  @IsString()
  @IsNotEmpty()
  term?: string | null;

  @IsString()
  @IsNotEmpty()
  status?: string | null;

  @IsString()
  @IsNotEmpty()
  academicYear?: string | null;

  @IsString()
  @IsNotEmpty()
  slug?: string | null;

  @IsString()
  @IsNotEmpty()
  address?: string | null;

  @IsString()
  @IsNotEmpty()
  phoneNumber?: string | null;
}

export class AddNewStudentsDto {
  students: [AddNewStudentsByImportDto];
}
