import { UniversityService } from './university.service';
import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { FilesModule } from '../files/files.module';
@Module({
  imports: [FilesModule],
  controllers: [UniversityController],
  providers: [UniversityService],
  exports: [UniversityService],
})
export class UniversityModule {}
