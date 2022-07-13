import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddNewCertificatedDto {
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsString()
  @IsOptional()
  issueDate?: string | null;

  @IsString()
  @IsOptional()
  organizer?: string | null;
}

export class AddNewCertificatesDto {
  certificated: [AddNewCertificatedDto];
}
