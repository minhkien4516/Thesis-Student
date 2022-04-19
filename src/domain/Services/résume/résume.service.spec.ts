import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../../database/database.module';
import { RésumeService } from './résume.service';

describe('RésumeService', () => {
  let service: RésumeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RésumeService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.development', '.env.production', '.env'],
          isGlobal: true,
        }),
        DatabaseModule,
      ],
    }).compile();

    service = module.get<RésumeService>(RésumeService);
  });
});
