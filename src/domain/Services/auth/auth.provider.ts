import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { authPackageProvideToken } from '../../../common/constants/authService.constant';

export const authProvider = [
  {
    provide: authPackageProvideToken,
    useFactory: (configService: ConfigService) => {
      return ClientProxyFactory.create({
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, './auth.proto'),
          url: configService.get('USER_GRPC_CONNECTION_URL'),
        },
      });
    },
    inject: [ConfigService],
  },
];
