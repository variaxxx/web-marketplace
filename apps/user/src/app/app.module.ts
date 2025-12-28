import { AddressModule } from "./address/address.module";
import { SellerApplicationModule } from "./seller-application/seller-application.module";
import { StoreModule } from "./store/store.module";
import { UserModule } from "./user/user.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";

export enum EnvKey {
  RMQ_URL = "RMQ_URL",
  MINIO_ENDPOINT = "MINIO_ENDPOINT",
  MINIO_PORT = "MINIO_PORT",
  MINIO_ACCESS_KEY = "MINIO_ACCESS_KEY",
  MINIO_SECRET_KEY = "MINIO_SECRET_KEY",
}

export const validationSchema = Joi.object({
  [EnvKey.RMQ_URL]: Joi.string().required(),
  [EnvKey.MINIO_ENDPOINT]: Joi.string(),
  [EnvKey.MINIO_PORT]: Joi.number().required(),
  [EnvKey.MINIO_ACCESS_KEY]: Joi.string().required(),
  [EnvKey.MINIO_SECRET_KEY]: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    UserModule,
    SellerApplicationModule,
    StoreModule,
    AddressModule,
    WishlistModule,
  ],
})
export class AppModule {}
