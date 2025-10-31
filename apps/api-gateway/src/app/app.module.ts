import { AuthController } from "./auth/auth.controller";
import { MailController } from "./mail/mail.controller";
import { SellerApplicationController } from "./seller-application/seller-application.controller";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MicroserviceName, MicroserviceRMQQueue } from "@web-marketplace/shared";

export const RMQ_URL = "amqp://guest:123123@localhost:5672";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MicroserviceName.AUTH_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [RMQ_URL],
          queue: MicroserviceRMQQueue.AUTH_SERVICE,
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: MicroserviceName.MAIL_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [RMQ_URL],
          queue: MicroserviceRMQQueue.MAIL_SERVICE,
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: MicroserviceName.USER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [RMQ_URL],
          queue: MicroserviceRMQQueue.USER_SERVICE,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [
    AuthController,
    MailController,
    SellerApplicationController,
  ],
  providers: [],
})
export class AppModule {}
