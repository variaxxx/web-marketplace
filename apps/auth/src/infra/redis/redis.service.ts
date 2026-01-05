import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async get(
    key: string,
  ): Promise<any> {
    return this.cacheManager.get(key);
  }

  public async set(
    key: string,
    value: any,
    ttl?: number,
  ): Promise<any> {
    return this.cacheManager.set(key, value, ttl);
  }

  public async del(
    key: string,
  ): Promise<boolean> {
    return this.cacheManager.del(key);
  }
}
