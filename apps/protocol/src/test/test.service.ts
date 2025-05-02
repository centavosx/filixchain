import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TestService {
  array: string[] = [];

  add() {
    this.array.push(crypto.randomUUID());
  }

  get() {
    return this.array;
  }
}
