import { PrismaModule } from "../../db/prisma.module";
import { EnvKey } from "../app.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { MicroserviceName, MicroserviceRMQQueue } from "@web-marketplace/shared";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: MicroserviceName.MAIL_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
              queue: MicroserviceRMQQueue.MAIL_SERVICE,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
      {
        name: MicroserviceName.USER_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
              queue: MicroserviceRMQQueue.USER_SERVICE,
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
