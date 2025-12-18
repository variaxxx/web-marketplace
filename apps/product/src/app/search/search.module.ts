import { PrismaModule } from "../../db/prisma.module";
import { EnvKey } from "../app.module";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchModule } from "@nestjs/elasticsearch";

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        node: config.getOrThrow(EnvKey.ES_NODE),
        auth: {
          username: config.getOrThrow(EnvKey.ES_USERNAME),
          password: config.getOrThrow(EnvKey.ES_PASSWORD),
        },
      }),
    }),
    PrismaModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {};
