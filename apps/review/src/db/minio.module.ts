import { MinioService } from "./minio.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
