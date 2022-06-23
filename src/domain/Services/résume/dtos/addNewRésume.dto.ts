import { IsOptional, IsString } from 'class-validator';

export class AddNewRésumeDto {
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsString()
  @IsOptional()
  studentName?: string | null;

  @IsString()
  @IsOptional()
  position?: string | null;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsString()
  @IsOptional()
  slug?: string | null;

  @IsString()
  @IsOptional()
  files?: string | null;
}
