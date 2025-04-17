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

    try {
      if (result) {
        return JSON.parse(result);
      }
    } catch {
      return result as T;
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

  async limitIncrementValid(key: string, maximumLimit = 3, ms = 86_400_000) {
    const currentKey = `limitter-${key}`;
    const value = await this.get<{ count: number; exp: number }>(currentKey);

    if (!value) {
      await this.set(
        currentKey,
        {
          count: 1,
          exp: Date.now() + ms,
        },
        ms,
      );
      return true;
    }

    const { count, exp } = value;

    const remaining = exp - Date.now();

    if (count >= maximumLimit) {
      return false;
    }

    await this.set(
      currentKey,
      {
        count: count + 1,
        exp,
      },
      remaining,
    );

    return true;
  }
}
