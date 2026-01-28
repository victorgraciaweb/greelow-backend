import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const globalPrefix = configService.get<string>('globalPrefix');
  const routeSwagger = configService.get<string>('routeSwagger');
  const port = configService.get<number>('port');
  const corsEnabled = configService.get<boolean>('corsEnabled');

  const titleSwagger = configService.get<string>('titleSwagger');
  const descriptionSwagger = configService.get<string>('descriptionSwagger');
  const versionSwagger = configService.get<string>('versionSwagger');

  // Global Prefix & CORS
  app.setGlobalPrefix(globalPrefix);
  if (corsEnabled) app.enableCors();

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle(titleSwagger)
    .setDescription(descriptionSwagger)
    .setVersion(versionSwagger)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/${routeSwagger}`, app, document);

  await app.listen(port);

  console.log(`🚀 App running on: http://localhost:${port}/${globalPrefix}`);
  console.log(
    `📄 Swagger docs: http://localhost:${port}/${globalPrefix}/${routeSwagger}`,
  );
}

bootstrap();
