import { MinioService } from "./minio.service";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
