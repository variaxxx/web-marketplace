import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { SellerApplicationController } from "./seller-application.controller";
import { SellerApplicationClientGrpc } from "./seller-application.grpc";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.SELLER_APPLICATION_GRPC,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE_NAMES.SELLER_APPLICATION_SERVICE,
            protoPath: PROTO_FILES_PATHS.SELLER_APPLICATION,
            url: config.getOrThrow<string>(EnvKey.USER_GRPC_URL),
          },
        }),
      },
    ]),
  ],
  controllers: [SellerApplicationController],
  providers: [SellerApplicationClientGrpc],
})
export class SellerApplicationModule {};
