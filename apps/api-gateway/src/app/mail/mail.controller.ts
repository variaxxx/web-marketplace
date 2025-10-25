import { MAIL_PATTERNS, MicroserviceName } from "../../../../../libs/shared/src";
import { Controller, Inject, Post, Req } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Request } from "express";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("mail")
export class MailController {
  constructor(
    @Inject(MicroserviceName.MAIL_SERVICE) private readonly mailClient: ClientProxy,
  ) {}

  @Post("verify")
  async verify(
    @Req() req: Request,
  ): Promise<any> {
    const token = req.cookies.accessToken;

    return await firstValueFrom(this.mailClient.send(MAIL_PATTERNS.VERIFY, { id: 1, accessToken: token }).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
