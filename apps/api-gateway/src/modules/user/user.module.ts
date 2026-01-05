import { EnvKey } from "../../core/config/env-key.enum";
import { MediaModule } from "../../infra/media/media.module";
import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { UserController } from "./user.controller";
import { UserClientGrpc } from "./user.grpc";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENT_NAMES.USER_GRPC,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGE_NAMES.USER_SERVICE,
            protoPath: PROTO_FILES_PATHS.USER,
            url: config.getOrThrow<string>(EnvKey.USER_GRPC_URL),
          },
        }),
      },
    ]),
    MediaModule,
  ],
  controllers: [UserController],
  providers: [UserClientGrpc],
})
export class UserModule {};
