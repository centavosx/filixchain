import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { AuthGuard } from './guards/auth.guard';
import { RedisService } from './redis/redis.service';
import { SocketAdapter } from './adapter/socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalGuards(new AuthGuard(configService, redisService));
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
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors({
    origin: configService.get('HTTP_ALLOWED_ORIGIN'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: `Content-Type, ${Session.HEADER_ACCESS_KEY.toLowerCase()}`,
    credentials: true,
  });
  app.useWebSocketAdapter(new SocketAdapter(app, configService));

  await app.listen(configService.get('HTTP_PORT'));
}
bootstrap();
