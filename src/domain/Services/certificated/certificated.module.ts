import { CertificatedController } from './certificated.controller';
import { CertificatedService } from './certificated.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [CertificatedController],
  providers: [CertificatedService],
  exports: [CertificatedService],
})
export class CertificatedModule {}
