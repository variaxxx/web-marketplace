import { EnvKey } from "../../core/config/env-key.enum";
import { MailService } from "./mail.service";
import { TemplateService } from "./template.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>(EnvKey.MAIL_HOST),
          port: config.getOrThrow<number>(EnvKey.MAIL_PORT),
          secure: process.env.NODE_ENV !== "development",
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
  ],
  providers: [
    MailService,
    TemplateService,
  ],
  exports: [MailService],
})
export class MailModule {};
