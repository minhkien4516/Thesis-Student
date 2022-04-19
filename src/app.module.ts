import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import databaseConfig from './database/database.config';
import { HealthModule } from './health/health.module';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsLoggerFilter } from './utils/exceptionsLogger.filter';
import { DatabaseModule } from './database/database.module';
import { RésumeModule } from './domain/Services/résume/résume.module';
import { SkillModule } from './domain/Services/skill/skill.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production', '.env'],
      isGlobal: true,
      load: [databaseConfig],
    }),
    HealthModule,
    DatabaseModule,
    RésumeModule,
    SkillModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    },
  ],
})
export class AppModule {}
