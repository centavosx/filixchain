import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './config.schema';
import { ConfigService } from './config.service';

const paths = {
  test: ['.env.test'],
  development: ['.env', '.env.local', '.env.development'],
  staging: ['.env.staging'],
  production: ['.env.production'],
};

const envPath = paths[process.env.NODE_ENV] || paths.development;

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate,
      envFilePath: envPath,
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
