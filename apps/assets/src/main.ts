import { AppModule } from "./app/app.module";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env.ASSETS_PORT || 3003;
  await app.listen(port);
  Logger.log(
    `🚀 Assets service is running on: http://localhost:${port}/`,
  );
}

bootstrap();
