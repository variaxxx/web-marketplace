import { SellerApplicationModule } from "./seller-application/seller-application.module";
import { UserModule } from "./user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import Joi from "joi";

export enum EnvKey {
  ACCESS_JWT_SECRET = "ACCESS_JWT_SECRET",
  RMQ_URL = "RMQ_URL",
}

export const validationSchema = Joi.object({
  [EnvKey.ACCESS_JWT_SECRET]: Joi.string().required(),
  [EnvKey.RMQ_URL]: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    JwtModule.register({ global: true }),
    UserModule,
    SellerApplicationModule,
  ],
})
export class AppModule {}
