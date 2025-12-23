import { PrismaModule } from "../../db/prisma.module";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {};
