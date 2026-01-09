import { MailModule } from "../../infra/mail/mail.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [MailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {};
