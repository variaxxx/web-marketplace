import { MailService } from "../../infra/mail/mail.service";
import { Injectable, Logger } from "@nestjs/common";
import { SendEmailVerificationPayload } from "@web-marketplace/backend";

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger();

  constructor(
    private readonly mailService: MailService,
  ) {}

  async sendEmailVerification(
    dto: SendEmailVerificationPayload,
  ): Promise<void> {
    try {
      this.logger.debug(`Email verification code: ${dto.code}`);

      await this.mailService.sendEmailVerification(dto.recipient, dto.code);

      this.logger.log(`Successfully sent email verification to ${dto.recipient}`);
    } catch (e) {
      throw new Error(`Error while sending verification email: ${e instanceof Error ? e.stack : e}`);
    }
  }
}
