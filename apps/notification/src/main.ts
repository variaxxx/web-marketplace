import { AppModule } from "./core/app.module";
import { EnvKey } from "./core/config/env-key.enum";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { MICROSERVICE_RMQ_QUEUE } from "@web-marketplace/backend";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useLogger(["log", "error", "warn", "debug", "verbose"]);

  const config = app.get(ConfigService);

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
      queue: MICROSERVICE_RMQ_QUEUE.NOTIFICATION_SERVICE,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  await app.init();

  Logger.log(
    `🚀 Auth service is running...`,
  );
}

bootstrap();
