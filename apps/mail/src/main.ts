import { AppModule } from "./app/app.module";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { MicroserviceErrorFilter } from "@web-marketplace/shared";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3002,
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
