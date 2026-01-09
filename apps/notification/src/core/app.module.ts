import { RmqModule } from "../infra/rmq/rmq.module";
import { EmailVerificationModule } from "../modules/email-verification/email-verification.module";
import { NotificationsModule } from "../modules/notifications/notifications.module";
import { validationSchema } from "./config/validation.schema";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    RmqModule,
    EmailVerificationModule,
    NotificationsModule,
  ],
})
export class AppModule {}
