import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config.schema';
import { NestedStringKey, NestedStringValue } from '../type/nested';
import { ClassToRecord } from '../type/class-to-record';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<K extends NestedStringKey<ClassToRecord<EnvironmentVariables>>>(key: K) {
    return this.configService.get(key) as NestedStringValue<
      ClassToRecord<EnvironmentVariables>,
      K
    >;
  }
}
