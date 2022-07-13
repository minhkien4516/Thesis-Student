import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddResumeCertificatedDto {
  @IsOptional()
  @IsString()
  cvId!: string;

  @IsOptional()
  @IsString()
  certificatedId!: string;
}
