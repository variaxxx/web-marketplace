import { AppModule } from "./core/app.module";
import { AllExceptionFilter, LoggerInterceptor, ResponseFormatInterceptor } from "./shared";
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
  );
  app.useGlobalInterceptors(
    new ResponseFormatInterceptor(),
    new LoggerInterceptor(),
  );
  app.use(cookieParser());

  const swaggerCfg = new DocumentBuilder()
    .setTitle("web-marketplace")
    .addCookieAuth("accessToken")
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
