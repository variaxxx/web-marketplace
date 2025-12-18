import { RpcAuthGuard } from "../../../../libs/shared/src";
import { ProductModule } from "./product/product.module";
import { SearchModule } from "./search/search.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import Joi from "joi";

export enum EnvKey {
  ES_NODE = "ES_NODE",
  ES_USERNAME = "ES_USERNAME",
  ES_PASSWORD = "ES_PASSWORD",
}

export const validationSchema = Joi.object({
  [EnvKey.ES_NODE]: Joi.string().required(),
  [EnvKey.ES_USERNAME]: Joi.string().required(),
  [EnvKey.ES_PASSWORD]: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    JwtModule.register({ global: true }),
    ProductModule,
    SearchModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RpcAuthGuard,
    },
  ],
})
export class AppModule {}
