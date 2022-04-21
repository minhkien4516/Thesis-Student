import { CertificatedController } from './certificated.controller';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import databaseConfig from '../../../database/database.config';
import { DatabaseModule } from '../../../database/database.module';
import { CertificatedService } from './certificated.service';

describe('SkillController', () => {
  let controller: CertificatedController;
  let service: CertificatedService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatedController],
      providers: [CertificatedService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.development', '.env.production', '.env'],
          isGlobal: true,
          load: [databaseConfig],
        }),
        DatabaseModule,
      ],
    }).compile();

    controller = module.get<CertificatedController>(CertificatedController);
    service = module.get<CertificatedService>(CertificatedService);
  });
});
