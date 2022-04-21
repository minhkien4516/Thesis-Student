import { IsNotEmpty, IsString } from 'class-validator';

export class AddNewCertificatedDto {
  @IsString()
  @IsNotEmpty()
  name?: string | null;

  @IsString()
  @IsNotEmpty()
  issueDate?: Date | null;

  @IsString()
  @IsNotEmpty()
  organizer?: string | null;
}

export class AddNewCertificatesDto {
  certificated: [AddNewCertificatedDto];
}
