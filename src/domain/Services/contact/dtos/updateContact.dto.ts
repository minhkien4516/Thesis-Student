import { PartialType } from '@nestjs/swagger';
import { AddNewContactDto } from './addNewContact.dto';

export class UpdateContactDto extends PartialType(AddNewContactDto) {}
