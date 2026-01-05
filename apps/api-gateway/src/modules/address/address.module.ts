import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { AddressController } from "./address.controller";
import { AddressClientGrpc } from "./address.grpc";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.ADDRESS_GRPC,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE_NAMES.ADDRESS_SERVICE,
            protoPath: PROTO_FILES_PATHS.ADDRESS,
            url: config.getOrThrow<string>(EnvKey.USER_GRPC_URL),
          },
        }),
      },
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressClientGrpc],
})
export class AddressModule {};
