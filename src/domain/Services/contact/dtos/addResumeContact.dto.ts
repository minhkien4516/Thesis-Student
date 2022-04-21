import { IsNotEmpty, IsString } from 'class-validator';

export class AddResumeContactDto {
  @IsNotEmpty()
  @IsString()
  cvId!: string;

  @IsNotEmpty()
  @IsString()
  contactInformationId!: string;
}
