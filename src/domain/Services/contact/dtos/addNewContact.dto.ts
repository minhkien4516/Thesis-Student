import { IsNotEmpty, IsString } from 'class-validator';

export class AddNewContactDto {
  @IsString()
  @IsNotEmpty()
  title?: string | null;

  @IsString()
  @IsNotEmpty()
  content?: string | null;
}

export class AddNewContactsDto {
  contact: [AddNewContactDto];
}
