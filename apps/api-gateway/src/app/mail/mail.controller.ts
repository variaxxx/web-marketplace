import { MicroserviceName } from "../../../../../libs/shared/src";
import { Controller, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Controller("mail")
export class MailController {
  constructor(
    @Inject(MicroserviceName.MAIL_SERVICE) private readonly mailClient: ClientProxy,
  ) {}
}
