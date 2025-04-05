import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.redisClient.get(key);

    if (typeof result === 'string') return result as T;

    if (result) {
      return JSON.parse(result);
    }

    return null;
  }

  async set(key: string, value: unknown, expiry?: number): Promise<void> {
    const valueToStore =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (expiry === undefined) {
      await this.redisClient.set(key, valueToStore);
    } else {
      await this.redisClient.set(key, valueToStore, 'PX', expiry);
    }
  }
  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
