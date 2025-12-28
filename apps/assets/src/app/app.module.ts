import { AssetsModule } from "./assets/assets.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";

export enum EnvKey {
  MINIO_ENDPOINT = "MINIO_ENDPOINT",
  MINIO_PORT = "MINIO_PORT",
  MINIO_ACCESS_KEY = "MINIO_ACCESS_KEY",
  MINIO_SECRET_KEY = "MINIO_SECRET_KEY",
}

export const validationSchema = Joi.object({
  [EnvKey.MINIO_ENDPOINT]: Joi.string(),
  [EnvKey.MINIO_PORT]: Joi.string().required(),
  [EnvKey.MINIO_ACCESS_KEY]: Joi.string().required(),
  [EnvKey.MINIO_SECRET_KEY]: Joi.string().required(),
});

@Module({
  imports: [
    AssetsModule,
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {};
