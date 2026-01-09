import { EnvKey } from "../../core/config/env-key.enum";
import { MediaModule } from "../../infra/media/media.module";
import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { StoreController } from "./store.controller";
import { StoreClientGrpc } from "./store.grpc";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

@Module({
  imports: [
    MediaModule,
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.STORE_GRPC,
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
  controllers: [StoreController],
  providers: [StoreClientGrpc],
})
export class StoreModule {};
