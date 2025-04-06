import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
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
