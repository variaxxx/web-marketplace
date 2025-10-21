import { AppModule } from "./app/app.module";
import { AllExceptionFilter } from "./common/filters/all-exception.filter";
import { RpcExceptionFilter } from "./common/filters/rpc.filter";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    },
  ));
  app.useGlobalFilters(
    new AllExceptionFilter(),
    new RpcExceptionFilter(),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/`,
  );
}

bootstrap();
