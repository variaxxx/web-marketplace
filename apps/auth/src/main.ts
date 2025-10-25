import { MicroserviceErrorFilter } from "../../../libs/shared/src";
import { AppModule } from "./app/app.module";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    },
  );

  app.useGlobalFilters(new MicroserviceErrorFilter());

  await app.listen();
  Logger.log(
    `🚀 Auth service is running...`,
  );
}

bootstrap();
