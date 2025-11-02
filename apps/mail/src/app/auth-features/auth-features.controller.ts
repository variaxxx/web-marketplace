import { AuthFeaturesService } from "./auth-features.service";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { IsPublic, MAIL_PATTERNS, SendEmailVerificationDto } from "@web-marketplace/shared";

@Controller()
export class AuthFeaturesController {
  constructor(
    private readonly authFeaturesService: AuthFeaturesService,
  ) {}

  @IsPublic()
  @EventPattern(MAIL_PATTERNS.SEND_EMAIL_VERIFICATION)
  async sendVerification(
    @Payload() payload: SendEmailVerificationDto,
  ): Promise<void> {
    return this.authFeaturesService.sendEmailVerification(payload);
  }
}
