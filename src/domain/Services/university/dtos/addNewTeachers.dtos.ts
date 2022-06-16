import { IsNotEmpty, IsString } from 'class-validator';

export class AddNewTeachersByImportDto {
  @IsString()
  @IsNotEmpty()
  firstName?: string | null;

  @IsString()
  @IsNotEmpty()
  lastName?: string | null;

  @IsString()
  @IsNotEmpty()
  fullName?: string | null;

  @IsString()
  @IsNotEmpty()
  email?: string | null;

  @IsString()
  @IsNotEmpty()
  position?: string | null;

  @IsString()
  @IsNotEmpty()
  department?: string | null;

  @IsString()
  @IsNotEmpty()
  slug?: string | null;

  @IsString()
  @IsNotEmpty()
  studentAmount?: number | null;

  @IsString()
  @IsNotEmpty()
  phoneNumber?: string | null;
}

export class AddNewTeachersDto {
  teachers: [AddNewTeachersByImportDto];
}
