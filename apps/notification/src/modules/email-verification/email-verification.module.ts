import { MailModule } from "../../infra/mail/mail.module";
import { EmailVerificationController } from "./email-verification.controller";
import { EmailVerificationService } from "./email-verification.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [MailModule],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
})
export class EmailVerificationModule {};
