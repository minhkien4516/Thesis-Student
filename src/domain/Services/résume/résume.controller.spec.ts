import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../../database/database.module';
import { RésumeController } from './résume.controller';
import { RésumeService } from './résume.service';

describe('CorporationController', () => {
  let controller: RésumeController;
  let service: RésumeService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RésumeController],
      providers: [RésumeService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.development', '.env.production', '.env'],
          isGlobal: true,
        }),
        DatabaseModule,
      ],
    }).compile();

    controller = module.get<RésumeController>(RésumeController);
    service = module.get<RésumeService>(RésumeService);
  });
});
