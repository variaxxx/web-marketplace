import { PrismaModule } from "../db/prisma.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import Joi from "joi";

export enum EnvKey {
  ACCESS_JWT_SECRET = "ACCESS_JWT_SECRET",
  REFRESH_JWT_SECRET = "REFRESH_JWT_SECRET",
}

export const validationSchema = Joi.object({
  ACCESS_JWT_SECRET: Joi.string().required(),
  REFRESH_JWT_SECRET: Joi.string().required(),
});

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
    ConfigModule.forRoot({
      validationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
