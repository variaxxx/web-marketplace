import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";
import { Module } from "@nestjs/common";

@Module({
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {};
