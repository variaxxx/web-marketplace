import { Controller, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { MAIL_PATTERNS, RpcAuthGuard, SendEmailVerificationDto } from "@web-marketplace/shared";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(RpcAuthGuard)
  @MessagePattern(MAIL_PATTERNS.VERIFY)
  async verify(
    // @Payload() payload:,
  ): Promise<any> {
    // console.log(payload.id);
    return { res: 1 };
  }

  @EventPattern(MAIL_PATTERNS.SEND_EMAIL_VERIFICATION)
  async sendVerification(
    @Payload() payload: SendEmailVerificationDto,
  ) {
    return this.appService.sendEmailVerification(payload);
  }
}
