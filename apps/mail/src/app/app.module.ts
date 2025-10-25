import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from "@nestjs/config";
import Joi from "joi";
import { MailerModule } from "@nestjs-modules/mailer";
import { RpcAuthGuard } from "@web-marketplace/shared";
import { JwtModule } from "@nestjs/jwt";

export enum EnvKeys {
  MAIL_HOST = "MAIL_HOST",
  MAIL_PORT = "MAIL_PORT",
  MAIL_USER = "MAIL_USER",
  MAIL_PASSWORD = "MAIL_PASSWORD",
  MAIL_SENDER = "MAIL_SENDER",
  CONFIRMATION_PAGE_URL = "CONFIRMATION_PAGE_URL",
}

export const validationSchema = Joi.object({
  [EnvKeys.MAIL_HOST]: Joi.string().required(),
  [EnvKeys.MAIL_PORT]: Joi.number().positive().required(),
  [EnvKeys.MAIL_USER]: Joi.string().required(),
  [EnvKeys.MAIL_PASSWORD]: Joi.string().required(),
  [EnvKeys.MAIL_SENDER]: Joi.string().required(),
  [EnvKeys.CONFIRMATION_PAGE_URL]: Joi.string().required(),
})

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>(EnvKeys.MAIL_HOST),
          port: config.getOrThrow<number>(EnvKeys.MAIL_PORT),
          secure: false,
          auth: {
            user: config.getOrThrow<string>(EnvKeys.MAIL_USER),
            pass: config.getOrThrow<string>(EnvKeys.MAIL_PASSWORD),
          },
          logger: true,
          debug: true,
        },
        defaults: {
          from: config.getOrThrow<string>(EnvKeys.MAIL_SENDER),
        }
      })
    }),
    JwtModule.register({}),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RpcAuthGuard,
  ],
})
export class AppModule {}
