import { BadRequestException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';

export class Transformer {
  static toNumber({ value }: TransformFnParams) {
    if (!value) return value;

    const converted = parseFloat(value);

    if (isNaN(converted)) {
      throw new BadRequestException('Not a valid number');
    }

    return converted;
  }

  static toBoolean({ value }: TransformFnParams) {
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }

    return value;
  }
}
