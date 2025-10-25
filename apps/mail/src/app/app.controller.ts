import { AppService } from "./app.service";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { MAIL_PATTERNS, SendEmailVerificationDto } from "@web-marketplace/shared";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern(MAIL_PATTERNS.SEND_EMAIL_VERIFICATION)
  async sendVerification(
    @Payload() payload: SendEmailVerificationDto,
  ): Promise<void> {
    return this.appService.sendEmailVerification(payload);
  }
}
