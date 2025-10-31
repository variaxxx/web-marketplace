import { PrismaModule } from "../../db/prisma.module";
import { EnvKey } from "../app.module";
import { SellerApplicationController } from "./seller-application.controller";
import { SellerApplicationService } from "./seller-application.service";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { MicroserviceName, MicroserviceRMQQueue } from "@web-marketplace/shared";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: MicroserviceName.AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
              queue: MicroserviceRMQQueue.AUTH_SERVICE,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [SellerApplicationController],
  providers: [SellerApplicationService],
})
export class SellerApplicationModule {};
