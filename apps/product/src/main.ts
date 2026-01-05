import { AppModule } from "./app/app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { MicroserviceErrorFilter, MicroserviceRMQQueue } from "@web-marketplace/shared";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useLogger(["log", "error", "warn", "debug", "verbose"]);
  app.useGlobalFilters(new MicroserviceErrorFilter());

  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    },
  ));

  await app.listen(process.env.PRODUCT_SERVICE_PORT);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL],
      queue: MicroserviceRMQQueue.PRODUCT_SERVICE,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  Logger.log(
    `🚀 Auth service is running...`,
  );
}

bootstrap();
