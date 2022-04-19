import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, DatabaseError } from 'sequelize';
import slugify from 'slugify';
import { AddNewRésumeDto } from './dtos/addNewRésume.dto';
import { RésumeFilter } from '../../interfaces';
import { UpdateRésumeDto } from './dtos/updateRésume.dto';
import { Résume } from '../../Models/résume.model';

@Injectable()
export class RésumeService {
  private readonly logger = new Logger('RésumeService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewRésume(
    addNewRésumeDto: AddNewRésumeDto,
  ): Promise<RésumeFilter[]> {
    try {
      if (!addNewRésumeDto.studentName) return [];
      const slug = slugify(addNewRésumeDto.studentName, {
        lower: true,
        trim: true,
        replacement: '-',
      });
      const inserted: RésumeFilter[] = await this.sequelize.query(
        'SP_AddNewResume @studentName=:studentName, @position=:position, @content=:content, @slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            studentName: addNewRésumeDto.studentName.trim(),
            position: addNewRésumeDto.position,
            content: addNewRésumeDto.content,
            slug,
          },
          raw: true,
        },
      );
      return inserted;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async UpdateRésume(id: string, updateRésumeDto?: UpdateRésumeDto) {
    try {
      if (!updateRésumeDto.studentName) return {};
      const slug = slugify(updateRésumeDto.studentName, {
        lower: true,
        trim: true,
        replacement: '-',
      });
      const updated = await this.sequelize.query(
        'SP_UpdateResume @id=:id,@studentName=:studentName,@position=:position,@content=:content,@slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            studentName: updateRésumeDto?.studentName?.trim() ?? null,
            position: updateRésumeDto?.position ?? null,
            content: updateRésumeDto?.content ?? null,

            slug,
          },
          raw: true,
          mapToModel: true,
          model: Résume,
        },
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
