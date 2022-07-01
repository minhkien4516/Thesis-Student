import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AddNewProjectDto {
  @IsString()
  @IsOptional()
  projectName?: string | null;

  @IsString()
  @IsOptional()
  startDate?: string | null;

  @IsString()
  @IsOptional()
  endDate?: string | null;

  @IsNumber()
  @IsOptional()
  teamSize?: number | null;

  @IsString()
  @IsOptional()
  role?: string | null;

  @IsString()
  @IsOptional()
  responsibilities?: string | null;

  @IsString()
  @IsOptional()
  sourceLink?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  technology?: [AddNewTechnologiesDto];
}

export class AddNewProjectsDto {
  project: [AddNewProjectDto];
}

export class AddNewTechnologiesDto {
  @IsString()
  @IsOptional()
  title?: string | null;

  @IsString()
  @IsOptional()
  content?: number | null;
}
