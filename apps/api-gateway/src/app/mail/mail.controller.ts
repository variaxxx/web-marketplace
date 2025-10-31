import { Controller, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { MicroserviceName } from "@web-marketplace/shared";

@Controller("mail")
export class MailController {
  constructor(
    @Inject(MicroserviceName.MAIL_SERVICE) private readonly mailClient: ClientProxy,
  ) {}
}
