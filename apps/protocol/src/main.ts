import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
        name: 'x-xsrf-token',
        in: 'header',
      },
      'csrf-token',
    )
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors({
    origin: ['https://your-frontend.com', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, x-xsrf-token, x-xsrf-nonce',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
