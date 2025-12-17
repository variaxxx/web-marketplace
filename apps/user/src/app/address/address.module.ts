import { PrismaModule } from "../../db/prisma.module";
import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {};
