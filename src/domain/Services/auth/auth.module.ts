import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { authProvider } from './auth.provider';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule],
  providers: [...authProvider, AuthService],
  exports: [...authProvider, AuthService],
})
export class AuthModule {}
