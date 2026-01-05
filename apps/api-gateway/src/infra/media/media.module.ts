import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { MediaClientGrpc } from "./media.grpc";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.MEDIA_GRPC,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE_NAMES.MEDIA_SERVICE,
            protoPath: PROTO_FILES_PATHS.MEDIA,
            url: config.getOrThrow<string>(EnvKey.MEDIA_GRPC_URL),
          },
        }),
      },
    ]),
  ],
  providers: [MediaClientGrpc],
  exports: [MediaClientGrpc],
})
export class MediaModule {};
