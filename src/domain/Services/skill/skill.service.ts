import { DatabaseError } from 'sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { Skill } from '../../Models/skill.model';
import { AddNewSkillDto } from './dtos/addNewSkill.dto';
import { AddResumeSkillDto } from './dtos/addResumeSkill.dto';
import { UpdateSkillDto } from './dtos/updateSkill.dto';
import slugify from 'vietnamese-slug';

@Injectable()
export class SkillService {
  private readonly logger = new Logger('SkillService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewSkill(addNewSkillDto: AddNewSkillDto): Promise<Skill> {
    try {
      if (!addNewSkillDto.name) return null;
      const slug = slugify(addNewSkillDto.name, {
        lower: true,
        trim: true,
        replacement: '-',
      });
      const inserted = await this.sequelize.query(
        'SP_AddNewSkills @name=:name, @rating=:rating, @slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            name: addNewSkillDto.name,
            rating: addNewSkillDto.rating,
            slug,
          },
          raw: true,
          mapToModel: true,
          model: Skill,
        },
      );
      console.log(inserted);
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async addResumeSkill(
    addResumeSkillDto: AddResumeSkillDto,
  ): Promise<any> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddResumeSkill @cvId=:cvId,@skillsId=:skillsId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...addResumeSkillDto,
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

  async UpdateSkill(id: string, updateSkillDto?: UpdateSkillDto) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateSkill @id=:id,@name=:name, @rating=:rating, @slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            name: updateSkillDto.name ?? null,
            rating: updateSkillDto.rating ?? null,
            slug: updateSkillDto.slug ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Skill,
        },
      );
      updated[0].slug = slugify(updated[0].name, {
        lower: true,
        trim: true,
        replacement: '-',
      });
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
