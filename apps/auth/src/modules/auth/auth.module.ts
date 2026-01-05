import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../core/config/microservice-client.names";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { MICROSERVICE_RMQ_QUEUE } from "@web-marketplace/backend";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.MAIL_RMQ,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
              queue: MICROSERVICE_RMQ_QUEUE.NOTIFICATION_SERVICE,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
      {
        name: MICROSERVICE_CLIENT_NAMES.USER_RMQ,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
              queue: MICROSERVICE_RMQ_QUEUE.USER_SERVICE,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {};
