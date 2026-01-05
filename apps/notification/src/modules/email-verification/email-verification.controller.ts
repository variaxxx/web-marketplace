import { RmqService } from "../../infra/rmq/rmq.service";
import { EmailVerificationService } from "./email-verification.service";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { MAIL_PATTERNS, SendEmailVerificationPayload } from "@web-marketplace/backend";

@Controller()
export class EmailVerificationController {
  constructor(
    private readonly service: EmailVerificationService,
    private readonly rmq: RmqService,
  ) {}

  @EventPattern(MAIL_PATTERNS.SEND_EMAIL_VERIFICATION)
  async sendVerification(
    @Payload() payload: SendEmailVerificationPayload,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    try {
      await this.service.sendEmailVerification(payload);
      this.rmq.ack(ctx);
    } catch (e) {
      this.rmq.nack(ctx, true);
      throw e;
    }
  }
}
