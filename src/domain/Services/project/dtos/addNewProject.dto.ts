import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddNewProjectDto {
  @IsString()
  @IsNotEmpty()
  projectName?: string | null;

  @IsString()
  @IsNotEmpty()
  startDate?: Date | null;

  @IsString()
  @IsNotEmpty()
  endDate?: Date | null;

  @IsNumber()
  @IsNotEmpty()
  teamSize?: Date | null;

  @IsString()
  @IsNotEmpty()
  role?: string | null;

  @IsString()
  @IsNotEmpty()
  responsibilities?: string | null;

  @IsString()
  @IsNotEmpty()
  sourceLink?: string | null;

  @IsString()
  @IsNotEmpty()
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  technology?: [AddNewTechnologiesDto];
}

export class AddNewProjectsDto {
  project: [AddNewProjectDto];
}

export class AddNewTechnologiesDto {
  @IsString()
  @IsNotEmpty()
  title?: string | null;

  @IsString()
  @IsNotEmpty()
  content?: number | null;
}
