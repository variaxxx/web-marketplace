import { MinioModule } from "../../db/minio.module";
import { PrismaModule } from "../../db/prisma.module";
import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
    MinioModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {};
