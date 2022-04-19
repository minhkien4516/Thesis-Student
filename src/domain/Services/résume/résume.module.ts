import { RésumeService } from './résume.service';
import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { RésumeController } from './résume.controller';
@Module({
  imports: [FilesModule],
  controllers: [RésumeController],
  providers: [RésumeService],
  exports: [RésumeService],
})
export class RésumeModule {}
