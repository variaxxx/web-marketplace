import { AppModule } from "./app/app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { MicroserviceErrorFilter, MicroserviceRMQQueue } from "@web-marketplace/shared";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL],
        queue: MicroserviceRMQQueue.USER_SERVICE,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalFilters(
    new MicroserviceErrorFilter(),
  );

  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    },
  ));

  await app.listen();
  Logger.log(
    `🚀 User service is running...`,
  );
}

bootstrap();
