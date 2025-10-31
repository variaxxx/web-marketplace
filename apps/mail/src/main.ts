import { AppModule } from "./app/app.module";
import { Logger } from "@nestjs/common";
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
        queue: MicroserviceRMQQueue.MAIL_SERVICE,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalFilters(
    new MicroserviceErrorFilter(),
  );

  await app.listen();
  Logger.log(
    `🚀 Mail service is running...`,
  );
}

bootstrap();
