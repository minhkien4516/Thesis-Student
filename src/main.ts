import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import ngrok from 'ngrok';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'university',
      protoPath: join(
        __dirname,
        './domain/Services/university/university.proto',
      ),
      url: configService.get<string>('GRPC_CONNECTION_URL'),
    },
  });
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('University Service')
    .setDescription('The University Service API description')
    .setVersion('1.0')
    .addTag('university')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3001);

  // (async () => {
  //   const url = await ngrok.connect({
  //     proto: 'http',
  //     addr: parseInt(process.env.PORT) || 3001,
  //     authtoken: process.env.NGROK_TOKEN,
  //     region: 'us',
  //   });
  //   const api = await ngrok.getApi();
  //   const tunnels = await api.listTunnels();
  //   console.log(
  //     `University local server is publicly-accessible at ${
  //       Object.values(tunnels)[0][0].public_url
  //     }`,
  //   );
  //   console.log(
  //     `Please combine (ctrl+click) to this link "${
  //       url + '/health'
  //     }" for check health service ^^!`,
  //   );
  // })();

  console.log(await app.getUrl());
}
bootstrap().then(() =>
  console.log(`University service is running on port ${process.env.PORT}`),
);
