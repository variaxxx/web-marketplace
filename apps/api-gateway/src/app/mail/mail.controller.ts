import { MAIL_PATTERNS, MicroserviceName } from "../../../../../libs/shared/src";
import { Controller, Inject, Post } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("mail")
export class MailController {
  constructor(
    @Inject(MicroserviceName.MAIL_SERVICE) private readonly mailClient: ClientProxy,
  ) {}

  @Post("verify")
  async verify(): Promise<any> {
    return await firstValueFrom(this.mailClient.send(MAIL_PATTERNS.VERIFY, { id: 1 }).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
