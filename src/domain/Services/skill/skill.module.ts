import { SkillService } from './skill.service';
import { Module } from '@nestjs/common';
import { SkillController } from './skill.controller';

@Module({
  imports: [],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
