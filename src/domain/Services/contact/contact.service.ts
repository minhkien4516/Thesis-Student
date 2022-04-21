import { AddNewContactDto } from './dtos/addNewContact.dto';
import { DatabaseError } from 'sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { Contact } from '../../Models/contact.model';
import { AddResumeContactDto } from './dtos/addResumeContact.dto';
import { UpdateContactDto } from './dtos/updateContact.dto';
@Injectable()
export class ContactService {
  private readonly logger = new Logger('ContactService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewContact(
    addNewContactDto: AddNewContactDto,
  ): Promise<Contact> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddNewContactInformation @title=:title, @content=:content',
        {
          type: QueryTypes.SELECT,
          replacements: {
            title: addNewContactDto.title,
            content: addNewContactDto.content,
          },
          raw: true,
          mapToModel: true,
          model: Contact,
        },
      );
      console.log(inserted);
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async addResumeContact(
    addResumeContactDto: AddResumeContactDto,
  ): Promise<any> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddResumeContactInformation @cvId=:cvId,@contactInformationId=:contactInformationId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...addResumeContactDto,
          },
          raw: true,
        },
      );
      console.log(inserted);
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async UpdateContact(id: string, updateContactDto?: UpdateContactDto) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateContactInformation @id=:id,@title=:title, @content=:content',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            title: updateContactDto.title ?? null,
            content: updateContactDto.content ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Contact,
        },
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
