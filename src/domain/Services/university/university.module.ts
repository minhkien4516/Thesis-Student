import { UniversityService } from './university.service';
import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { FilesModule } from '../files/files.module';
import { AuthModule } from '../auth/auth.module';
import { RésumeModule } from '../résume/résume.module';
import { EmailModule } from '../../../utils/email/email.module';
@Module({
  imports: [FilesModule, AuthModule, RésumeModule, EmailModule],
  controllers: [UniversityController],
  providers: [UniversityService],
  exports: [UniversityService],
})
export class UniversityModule {}
