import { UniversityService } from './university.service';
import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { FilesModule } from '../files/files.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [FilesModule, AuthModule],
  controllers: [UniversityController],
  providers: [UniversityService],
  exports: [UniversityService],
})
export class UniversityModule {}
