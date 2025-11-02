import { AuthModule } from "./auth/auth.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { RpcAuthGuard } from "@web-marketplace/shared";
import Joi from "joi";

export enum EnvKey {
  ACCESS_JWT_SECRET = "ACCESS_JWT_SECRET",
  REFRESH_JWT_SECRET = "REFRESH_JWT_SECRET",
  EMAIL_VERIFICATION_JWT_SECRET = "EMAIL_VERIFICATION_JWT_SECRET",
  RMQ_URL = "RMQ_URL",
}

export const validationSchema = Joi.object({
  [EnvKey.ACCESS_JWT_SECRET]: Joi.string().required(),
  [EnvKey.REFRESH_JWT_SECRET]: Joi.string().required(),
  [EnvKey.EMAIL_VERIFICATION_JWT_SECRET]: Joi.string().required(),
  [EnvKey.RMQ_URL]: Joi.string().required(),
});

@Module({
  imports: [
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RpcAuthGuard,
    },
  ],
})
export class AppModule {}
