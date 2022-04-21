import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
