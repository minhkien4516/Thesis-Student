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
import { AddNewSkillsDto } from './dtos/addNewSkill.dto';
import { UpdateSkillDto } from './dtos/updateSkill.dto';
import { SkillService } from './skill.service';

@Controller('skill')
export class SkillController {
  private readonly logger = new Logger('SkillController');

  constructor(private skillService: SkillService) {}

  @Post()
  async addNewResumeSkill(
    @Query('cvId') cvId: string,
    @Body() addNewSkillsDto: AddNewSkillsDto,
  ) {
    try {
      const multiSkill = await Promise.all(
        addNewSkillsDto.skills.map(async (item) => {
          const skill = await this.skillService.addNewSkill(item);
          console.log(skill);
          await this.skillService.addJobSkill({
            skillsId: skill.id,
            cvId,
          });
          return skill;
        }),
      );
      return multiSkill;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch()
  public async updateSkill(
    @Query('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    try {
      const result = await this.skillService.UpdateSkill(id, updateSkillDto);
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
