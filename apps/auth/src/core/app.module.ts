import { PrismaModule } from "../infra/db/prisma.module";
import { RedisModule } from "../infra/redis/redis.module";
import { RmqModule } from "../infra/rmq/rmq.module";
import { AuthModule } from "../modules/auth/auth.module";
import { validationSchema } from "./config/validation.schema";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    PrismaModule,
    RedisModule,
    RmqModule,
    AuthModule,
  ],
})
export class AppModule {}
