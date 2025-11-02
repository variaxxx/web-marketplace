import { AuthFeaturesModule } from "./auth-features/auth-features.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { RpcAuthGuard } from "@web-marketplace/shared";
import Joi from "joi";

export enum EnvKey {
  MAIL_HOST = "MAIL_HOST",
  MAIL_PORT = "MAIL_PORT",
  MAIL_USER = "MAIL_USER",
  MAIL_PASSWORD = "MAIL_PASSWORD",
  MAIL_SENDER = "MAIL_SENDER",
  CONFIRMATION_PAGE_URL = "CONFIRMATION_PAGE_URL",
  ACCESS_JWT_SECRET = "ACCESS_JWT_SECRET",
  RMQ_URL = "RMQ_URL",
}

export const validationSchema = Joi.object({
  [EnvKey.MAIL_HOST]: Joi.string().required(),
  [EnvKey.MAIL_PORT]: Joi.number().positive().required(),
  [EnvKey.MAIL_USER]: Joi.string().required(),
  [EnvKey.MAIL_PASSWORD]: Joi.string().required(),
  [EnvKey.MAIL_SENDER]: Joi.string().required(),
  [EnvKey.CONFIRMATION_PAGE_URL]: Joi.string().required(),
  [EnvKey.ACCESS_JWT_SECRET]: Joi.string().required(),
  [EnvKey.RMQ_URL]: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>(EnvKey.MAIL_HOST),
          port: config.getOrThrow<number>(EnvKey.MAIL_PORT),
          secure: false,
          auth: {
            user: config.getOrThrow<string>(EnvKey.MAIL_USER),
            pass: config.getOrThrow<string>(EnvKey.MAIL_PASSWORD),
          },
        },
        defaults: {
          from: config.getOrThrow<string>(EnvKey.MAIL_SENDER),
        },
      }),
    }),
    JwtModule.register({ global: true }),
    AuthFeaturesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RpcAuthGuard,
    },
  ],
})
export class AppModule {}
