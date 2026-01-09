import { RMQ_QUEUE } from "../../../../../libs/backend/src";
import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../core/config/microservice-client.names";
import { SellerApplicationController } from "./seller-application.controller";
import { SellerApplicationService } from "./seller-application.service";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.AUTH_RMQ,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
              queue: RMQ_QUEUE.AUTH_SERVICE,
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
