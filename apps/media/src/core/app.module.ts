import { MinioModule } from "../infra/minio/minio.module";
import { RmqModule } from "../infra/rmq/rmq.module";
import { MediaInternalModule } from "../modules/media-internal/media-internal.module";
import { MediaPublicModule } from "../modules/media-public/media-public.module";
import { validationSchema } from "./config/validation.schema";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    MinioModule,
    RmqModule,
    MediaInternalModule,
    MediaPublicModule,
  ],
})
export class AppModule {};
