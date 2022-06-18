import { ResumeFilter } from './../../interfaces/getRésumeForClients.interface';
import { AddStudentResumeDto } from './dtos/addStudentResume.dto';
import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, DatabaseError } from 'sequelize';
import slugify from 'vietnamese-slug';
import { AddNewRésumeDto } from './dtos/addNewRésume.dto';
import { RésumeFilter, StudentDetail } from '../../interfaces';
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
      if (!addNewRésumeDto.name) return [];
      const slug = slugify(addNewRésumeDto.name);
      const inserted: RésumeFilter[] = await this.sequelize.query(
        'SP_AddNewResume @name=:name,@studentName=:studentName, @position=:position, @content=:content, @slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            name: addNewRésumeDto.name.trim(),
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

  public async addStudentResume(
    addStudentResumeDto: AddStudentResumeDto,
  ): Promise<any> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddStudentResume @cvId=:cvId,@studentId=:studentId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...addStudentResumeDto,
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

  async UpdateRésume(id: string, updateRésumeDto?: UpdateRésumeDto) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateResume @id=:id,@name=:name,@studentName=:studentName,@position=:position,@content=:content,@slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            name: updateRésumeDto?.name.trim() ?? null,
            studentName: updateRésumeDto?.studentName?.trim() ?? null,
            position: updateRésumeDto?.position ?? null,
            content: updateRésumeDto?.content ?? null,
            slug: updateRésumeDto?.slug ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Résume,
        },
      );

      updated[0].slug = slugify(updated[0].name);
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getResumeByStudentId(
    id: string,
    limit: number,
    offset: number,
  ): Promise<RésumeFilter[]> {
    try {
      if (limit < 1 || offset < 0) return [];
      const resume: RésumeFilter[] = await this.sequelize.query(
        'SP_GetFullResumeForStudentById @id=:id, @limit=:limit, @offset=:offset',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            limit,
            offset,
          },
        },
      );
      return resume;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getFullResume(id: string): Promise<StudentDetail[]> {
    try {
      const resume: StudentDetail[] = await this.sequelize.query(
        'SP_GetFullResumeForStudent @id=:id',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
          },
        },
      );
      return resume;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
  public async getResumeByStudentIdAndCvId(
    id: string,
    cvId: string,
  ): Promise<ResumeFilter[]> {
    try {
      const resume: ResumeFilter[] = await this.sequelize.query(
        'SP_GetFullResumeForStudentByStudentId @id=:id, @cvId=:cvId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            cvId,
          },
        },
      );
      return resume;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
  async getTotalResumeByStudentIdAndCvId(id: string, cvId: string) {
    try {
      const total = await this.sequelize.query(
        'SP_GetTotalCVForStudentByStudentId @id=:id, @cvId=:cvId ',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            cvId,
          },
          raw: true,
          mapToModel: true,
          model: Résume,
        },
      );
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getTotalResumeByStudentId(id: string) {
    try {
      const total = await this.sequelize.query(
        'SP_GetTotalCVForStudentById @id=:id ',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
          },
          raw: true,
          mapToModel: true,
          model: Résume,
        },
      );
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getAllDataForResumeByResumeId(id: string) {
    try {
      const total = await this.sequelize.query(
        'SP_GetAllDataForCVByStudentId @cvId=:id',
        {
          type: QueryTypes.RAW,
          replacements: {
            id,
          },
          raw: true,
        },
      );
      if (
        typeof Object.keys(total) == null ||
        typeof Object.keys(total) == 'undefined' ||
        !total[0].length
      )
        return total[0];
      {
        const info: string = total[0]
          .map((each: string) => {
            return Object.values(each)[0];
          })
          .reduce((acc: string, curr: string) => acc + curr, '');
        return JSON.parse(info);
      }
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
