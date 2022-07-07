import { IsOptional, IsString } from 'class-validator';

export class ModifyInternship {
  @IsString()
  @IsOptional()
  internshipCertification?: string | null;

  @IsString()
  @IsOptional()
  internshipReport?: string | null;

  @IsString()
  @IsOptional()
  internshipFeedback?: string | null;

  @IsString()
  @IsOptional()
  internshipSurvey?: string | null;
}
