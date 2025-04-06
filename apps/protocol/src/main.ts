import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { AuthGuard } from './guards/auth.guard';
import { CookieInterceptor } from './interceptors/cookie.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new CookieInterceptor(configService));
  app.useGlobalGuards(new AuthGuard(app.get(Reflector), configService));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Peso In Blockchain')
    .setDescription('This blockchain api for peso')
    .addApiKey(
      {
        type: 'apiKey',
        name: Session.HEADER_ACCESS_KEY.toLowerCase(),
        in: 'header',
      },
      Session.HEADER_ACCESS_KEY.toLowerCase(),
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: Session.HEADER_REFRESH_KEY.toLowerCase(),
        in: 'header',
      },
      Session.HEADER_REFRESH_KEY.toLowerCase(),
    )
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: `Content-Type, ${Session.HEADER_ACCESS_KEY.toLowerCase()}, ${Session.HEADER_REFRESH_KEY.toLowerCase()}`,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
