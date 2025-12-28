import { SellerReviewModule } from "./seller-review/seller-review.module";
import KeyvRedis from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Joi from "joi";

export enum EnvKey {
  RMQ_URL = "RMQ_URL",
  MINIO_ENDPOINT = "MINIO_ENDPOINT",
  MINIO_PORT = "MINIO_PORT",
  MINIO_ACCESS_KEY = "MINIO_ACCESS_KEY",
  MINIO_SECRET_KEY = "MINIO_SECRET_KEY",
  REDIS_HOST = "REDIS_HOST",
  REDIS_PORT = "REDIS_PORT",
  REDIS_PASSWORD = "REDIS_PASSWORD",
}

export const validationSchema = Joi.object({
  [EnvKey.RMQ_URL]: Joi.string().required(),
  [EnvKey.MINIO_ENDPOINT]: Joi.string(),
  [EnvKey.MINIO_PORT]: Joi.string().required(),
  [EnvKey.MINIO_ACCESS_KEY]: Joi.string().required(),
  [EnvKey.MINIO_SECRET_KEY]: Joi.string().required(),
  [EnvKey.REDIS_HOST]: Joi.string(),
  [EnvKey.REDIS_PORT]: Joi.string().required(),
  [EnvKey.REDIS_PASSWORD]: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>(EnvKey.REDIS_HOST) || "localhost";
        const port = config.getOrThrow<string>(EnvKey.REDIS_PORT);
        const password = config.getOrThrow<string>(EnvKey.REDIS_PASSWORD);
        return {
          stores: [
            new KeyvRedis(`redis://:${password}@${host}:${port}`),
          ],
          ttl: 1000,
        };
      },
      isGlobal: true,
    }),
    SellerReviewModule,
  ],
})
export class AppModule {}
