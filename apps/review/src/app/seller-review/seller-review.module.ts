import { MinioModule } from "../../db/minio.module";
import { PrismaModule } from "../../db/prisma.module";
import { SellerReviewController } from "./seller-review.controller";
import { SellerReviewService } from "./seller-review.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
    MinioModule,
  ],
  controllers: [
    SellerReviewController,
  ],
  providers: [
    SellerReviewService,
  ],
})
export class SellerReviewModule {};
