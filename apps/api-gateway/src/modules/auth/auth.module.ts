import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { AuthController } from "./auth.controller";
import { AuthClientGrpc } from "./auth.grpc";
import { AuthClientRmq } from "./auth.rmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { RMQ_QUEUE } from "@web-marketplace/backend";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.AUTH_GRPC,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE_NAMES.AUTH_SERVICE,
            protoPath: PROTO_FILES_PATHS.AUTH,
            url: config.getOrThrow<string>(EnvKey.AUTH_GRPC_URL),
          },
        }),
      },
      {
        name: MICROSERVICE_CLIENT_NAMES.AUTH_RMQ,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
            queue: RMQ_QUEUE.AUTH_SERVICE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthClientGrpc, AuthClientRmq],
})
export class AuthModule {};
