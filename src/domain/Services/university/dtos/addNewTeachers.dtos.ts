import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
  @Min(0)
  studentAmount?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
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
