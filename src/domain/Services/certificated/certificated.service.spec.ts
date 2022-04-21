import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import databaseConfig from '../../../database/database.config';
import { DatabaseModule } from '../../../database/database.module';
import { CertificatedService } from './certificated.service';

describe('SkillService', () => {
  let service: CertificatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<CertificatedService>(CertificatedService);
  });
});
