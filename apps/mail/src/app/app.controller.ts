import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from "@nestjs/microservices";
import { MAIL_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MAIL_PATTERNS.VERIFY)
  async verify(
    @Payload() payload: any,
  ): Promise<any> {
    console.log(payload.id);
    throw new Error("wtf");
    return { res: 1 };
  }
}
