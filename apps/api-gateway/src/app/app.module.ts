import { MicroserviceName } from "../../../../libs/shared/src";
import { AppService } from "./app.service";
import { AuthController } from "./auth/auth.controller";
import { MailController } from "./mail/mail.controller";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MicroserviceName.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: "localhost",
          port: 3001,
        },
      },
      {
        name: MicroserviceName.MAIL_SERVICE,
        transport: Transport.TCP,
        options: {
          host: "localhost",
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [
    AuthController,
    MailController,
  ],
  providers: [AppService],
})
export class AppModule {}
