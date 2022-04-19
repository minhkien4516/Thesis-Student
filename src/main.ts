import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Student Service')
    .setDescription('The Student Service API description')
    .setVersion('1.0')
    .addTag('students')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3001);
  console.log(await app.getUrl());
}
bootstrap().then(() =>
  console.log(`Student server is running on port ${process.env.PORT}`),
);
