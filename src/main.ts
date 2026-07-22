import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Toutes les routes sont préfixées : /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Le frontend Angular tourne sur un autre port : on l'autorise explicitement.
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:4200').split(','),
    credentials: true,
  });

  // Validation automatique des DTOs à partir des décorateurs class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // retire les champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // ... et rejette la requête si on en envoie
      transform: true, // convertit les types (ex. "20" -> 20)
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Diakonos API')
    .setDescription(
      'API de gestion financière ecclésiale du réseau MSA — Sophos Studios',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API      : http://localhost:${port}/api/v1`);
  console.log(`Swagger  : http://localhost:${port}/api/docs`);
}
void bootstrap();
