import { EnvKey } from "../../core/config/env-key.enum";
import { RedisService } from "./redis.service";
import KeyvRedis from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>(EnvKey.REDIS_HOST) || "localhost";
        const port = config.getOrThrow<string>(EnvKey.REDIS_PORT);
        const user = config.get<string>(EnvKey.REDIS_USER);
        const password = config.getOrThrow<string>(EnvKey.REDIS_PASSWORD);
        return {
          stores: [
            new KeyvRedis(`redis://${user}:${password}@${host}:${port}`),
          ],
          ttl: 1000,
        };
      },
      isGlobal: true,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {};
