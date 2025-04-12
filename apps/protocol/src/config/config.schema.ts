import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  HTTP_PORT: number = 3002;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  WS_PORT: number = 0;

  @IsString()
  SESSION_SECRET_KEY: string;

  @IsOptional()
  @IsString()
  @IsIn(['production', 'staging', 'development'])
  NODE_ENV: 'production' | 'staging' | 'development' = 'development';

  @IsOptional()
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  REDIS_PORT: number = 6379;

  @IsString()
  REDIS_PASS: string;

  @Transform(({ value }) => value?.split(','))
  @IsString({
    each: true,
  })
  HTTP_ALLOWED_ORIGIN: string[];

  @Transform(({ value }) => value?.split(','))
  @IsString({
    each: true,
  })
  WS_ALLOWED_ORIGIN: string[];

  @IsString()
  SERVER_USER_AGENT: string;

  @IsString()
  MINER_USER_AGENT: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
