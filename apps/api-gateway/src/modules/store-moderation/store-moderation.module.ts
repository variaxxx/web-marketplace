import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { StoreEditRequestController } from "./store-edit-request.controller";
import { StoreModerationClientGrpc } from "./store-moderation.grpc";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.STORE_MODERATION_GRPC,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE_NAMES.STORE_SERVICE,
            protoPath: PROTO_FILES_PATHS.STORE,
            url: config.getOrThrow<string>(EnvKey.USER_GRPC_URL),
          },
        }),
      },
    ]),
  ],
  controllers: [StoreEditRequestController],
  providers: [StoreModerationClientGrpc],
})
export class StoreModerationModule {};
