import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AddNewContactsDto } from './dtos/addNewContact.dto';
import { UpdateContactDto } from './dtos/updateContact.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger('ContactController');

  constructor(private contactService: ContactService) {}

  @Post()
  async addNewResumeContact(
    @Query('cvId') cvId: string,
    @Body() addNewContactsDto: AddNewContactsDto,
  ) {
    try {
      const multiContact = await Promise.all(
        addNewContactsDto.contact.map(async (item) => {
          const contact = await this.contactService.addNewContact(item);
          console.log(contact);
          await this.contactService.addResumeContact({
            contactInformationId: contact.id,
            cvId,
          });
          return contact;
        }),
      );
      return multiContact;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch()
  public async updateContact(
    @Query('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    try {
      const result = await this.contactService.UpdateContact(
        id,
        updateContactDto,
      );
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
