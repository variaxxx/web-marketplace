import { Global, Inject, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";

export const MINIO_TOKEN = "MINIO_INJECT_TOKEN";

export function InjectMinio(): ParameterDecorator {
  return Inject(MINIO_TOKEN);
}

@Global()
@Module({
  exports: [MINIO_TOKEN],
  providers: [{
    inject: [ConfigService],
    provide: MINIO_TOKEN,
    useFactory: async (
      configService: ConfigService,
    ): Promise<Client> => {
      const client = new Client({
        endPoint: configService.get<string>("MINIO_ENDPOINT") || "localhost",
        port: configService.getOrThrow<number>("MINIO_PORT"),
        accessKey: configService.getOrThrow<string>("MINIO_ACCESS_KEY"),
        secretKey: configService.getOrThrow<string>("MINIO_SECRET_KEY"),
        useSSL: false,
      });
      return client;
    },
  }],
})
export class MinioModule {}
