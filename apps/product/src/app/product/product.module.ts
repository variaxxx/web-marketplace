import { MinioModule } from "../../db/minio.module";
import { PrismaModule } from "../../db/prisma.module";
import { SearchModule } from "../search/search.module";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
    SearchModule,
    MinioModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {};
