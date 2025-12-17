import { AppModule } from "./app/app.module";
import { AllExceptionFilter } from "./common/filters/all-exception.filter";
import { RpcExceptionFilter } from "./common/filters/rpc.filter";
import { LoggerInterceptor } from "./common/interceptors/logger.interceptor";
import { ResponseFormatInterceptor } from "./common/interceptors/res-format.interceptor";
import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (): BadRequestException => new BadRequestException("Validation failed"),
    },
  ));
  app.useGlobalFilters(
    new AllExceptionFilter(),
    new RpcExceptionFilter(),
  );
  app.useGlobalInterceptors(
    new ResponseFormatInterceptor(),
    new LoggerInterceptor(),
  );
  app.use(cookieParser());

  const swaggerCfg = new DocumentBuilder()
    .setTitle("web-marketplace")
    .build();

  const swaggerDocFactory = (): any => SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup("swagger", app, swaggerDocFactory);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/`,
  );
}

bootstrap();
