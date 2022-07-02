import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FilterTeacherDto {
  @IsOptional()
  @IsString()
  position?: string | null;

  @IsOptional()
  @IsString()
  fullName?: string | null;

  @IsOptional()
  @IsString()
  department?: string | null;
}
