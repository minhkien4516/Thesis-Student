import { DatabaseError } from 'sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { AddNewCertificatedDto } from './dtos/addNewCertificated.dto';
import { Certificated } from '../../Models/certificated.model';
import { AddResumeCertificatedDto } from './dtos/addResumeCertificated.dto';
import { UpdateCertificatedDto } from './dtos/updateCertificated.dto';
@Injectable()
export class CertificatedService {
  private readonly logger = new Logger('CertificatedService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewCertificated(
    addNewCertificatedDto: AddNewCertificatedDto,
  ): Promise<Certificated> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddNewCertificated @name=:name, @issueDate=:issueDate, @organizer=:organizer',
        {
          type: QueryTypes.SELECT,
          replacements: {
            name: addNewCertificatedDto.name,
            issueDate: addNewCertificatedDto.issueDate,
            organizer: addNewCertificatedDto.organizer,
          },
          raw: true,
          mapToModel: true,
          model: Certificated,
        },
      );
      console.log(inserted);
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async addResumeCertificated(
    addResumeCertificatedDto: AddResumeCertificatedDto,
  ): Promise<any> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddResumeCertificated @cvId=:cvId,@certificatedId=:certificatedId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...addResumeCertificatedDto,
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

  async UpdateCertificated(
    id: string,
    updateCertificatedDto?: UpdateCertificatedDto,
  ) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateCertificated @id=:id,@name=:name, @issueDate=:issueDate, @organizer=:organizer',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            name: updateCertificatedDto.name ?? null,
            issueDate: updateCertificatedDto.issueDate ?? null,
            organizer: updateCertificatedDto.organizer ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Certificated,
        },
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
