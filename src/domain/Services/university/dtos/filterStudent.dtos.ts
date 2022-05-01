import { IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';

export class FilterStudentDto {
  @IsOptional()
  @IsString()
  identityNumber?: string | null;

  @IsOptional()
  @IsString()
  fullName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(13)
  status?: string | null;
}
