import { RMQ_QUEUE } from "../../../../../libs/backend/src";
import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../core/config/microservice-client.names";
import { MediaService } from "./media.service";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.MEDIA_RMQ,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
            queue: RMQ_QUEUE.MEDIA_SERVICE,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {};
