import { IsOptional, IsString } from 'class-validator';

export class AddNewRésumeDto {
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
}
