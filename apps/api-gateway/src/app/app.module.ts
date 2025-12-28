import { AuthGuard } from "../common/guards/auth.guard";
import { AuthController } from "./auth/auth.controller";
import { CategoryController } from "./category/category.controller";
import { ProductController } from "./product/product.controller";
import { SellerApplicationController } from "./seller-application/seller-application.controller";
import { SellerReviewController } from "./seller-review/seller-review.controller";
import { StoreController } from "./store/store.controller";
import { UserController } from "./user/user.controller";
import { WishlistController } from "./wishlist/wishlist.controller";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { MicroserviceName, MicroserviceRMQQueue } from "@web-marketplace/shared";
import Joi from "joi";

export enum EnvKey {
  ACCESS_JWT_SECRET = "ACCESS_JWT_SECRET",
  RMQ_URL = "RMQ_URL",
  MINIO_ENDPOINT = "MINIO_ENDPOINT",
  MINIO_PORT = "MINIO_PORT",
  MINIO_ACCESS_KEY = "MINIO_ACCESS_KEY",
  MINIO_SECRET_KEY = "MINIO_SECRET_KEY",
}

export const validationSchema = Joi.object({
  [EnvKey.ACCESS_JWT_SECRET]: Joi.string().required(),
  [EnvKey.RMQ_URL]: Joi.string().required(),
  [EnvKey.MINIO_ENDPOINT]: Joi.string(),
  [EnvKey.MINIO_PORT]: Joi.number().required(),
  [EnvKey.MINIO_ACCESS_KEY]: Joi.string().required(),
  [EnvKey.MINIO_SECRET_KEY]: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    JwtModule.register({ global: true }),
    ClientsModule.registerAsync([
      {
        name: MicroserviceName.AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
            queue: MicroserviceRMQQueue.AUTH_SERVICE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: MicroserviceName.MAIL_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
            queue: MicroserviceRMQQueue.MAIL_SERVICE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: MicroserviceName.USER_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
            queue: MicroserviceRMQQueue.USER_SERVICE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: MicroserviceName.PRODUCT_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
            queue: MicroserviceRMQQueue.PRODUCT_SERVICE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: MicroserviceName.REVIEW_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
            queue: MicroserviceRMQQueue.REVIEW_SERVICE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [
    AuthController,
    SellerApplicationController,
    UserController,
    StoreController,
    ProductController,
    CategoryController,
    WishlistController,
    SellerReviewController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
