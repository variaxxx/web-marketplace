import { AppModule } from "./core/app.module";
import { EnvKey } from "./core/config/env-key.enum";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { RMQ_QUEUE } from "@web-marketplace/backend";
import { GRPC_PACKAGE_NAMES, PROTO_FILES_PATHS } from "@web-marketplace/contracts";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.useLogger(["log", "error", "warn", "debug", "verbose"]);

  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    },
  ));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
      queue: RMQ_QUEUE.MEDIA_SERVICE,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: GRPC_PACKAGE_NAMES.MEDIA_SERVICE,
      protoPath: PROTO_FILES_PATHS.MEDIA,
      url: config.getOrThrow<string>(EnvKey.MEDIA_GRPC_URL),
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  const port = Number(config.getOrThrow<string>(EnvKey.MEDIA_SERVER_PORT));

  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
    `🚀 Media service is running on port ${port}...`,
  );
}

bootstrap();
