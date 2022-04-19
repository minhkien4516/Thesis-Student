import { PartialType } from '@nestjs/swagger';
import { AddNewSkillDto } from './addNewSkill.dto';

export class UpdateSkillDto extends PartialType(AddNewSkillDto) {}
