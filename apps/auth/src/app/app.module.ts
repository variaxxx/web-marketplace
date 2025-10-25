import { MicroserviceName } from "../../../../libs/shared/src";
import { PrismaModule } from "../db/prisma.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ClientsModule, Transport } from "@nestjs/microservices";
import Joi from "joi";

export enum EnvKey {
  ACCESS_JWT_SECRET = "ACCESS_JWT_SECRET",
  REFRESH_JWT_SECRET = "REFRESH_JWT_SECRET",
  EMAIL_VERIFICATION_JWT_SECRET = "EMAIL_VERIFICATION_JWT_SECRET",
}

export const validationSchema = Joi.object({
  [EnvKey.ACCESS_JWT_SECRET]: Joi.string().required(),
  [EnvKey.REFRESH_JWT_SECRET]: Joi.string().required(),
  [EnvKey.EMAIL_VERIFICATION_JWT_SECRET]: Joi.string().required(),
});

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
    ConfigModule.forRoot({ validationSchema }),
    ClientsModule.register([
      {
        name: MicroserviceName.MAIL_SERVICE,
        transport: Transport.TCP,
        options: {
          host: "localhost",
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
