import { IsNotEmpty, IsString } from 'class-validator';

export class AddResumeProjectDto {
  @IsNotEmpty()
  @IsString()
  cvId!: string;

  @IsNotEmpty()
  @IsString()
  projectId!: string;
}

export class AddProjectTechnologyDto {
  @IsNotEmpty()
  @IsString()
  projectId!: string;

  @IsNotEmpty()
  @IsString()
  technologyId!: string;
}
