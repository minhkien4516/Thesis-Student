import { IsNotEmpty, IsString } from 'class-validator';

export class AddResumeCertificatedDto {
  @IsNotEmpty()
  @IsString()
  cvId!: string;

  @IsNotEmpty()
  @IsString()
  certificatedId!: string;
}
