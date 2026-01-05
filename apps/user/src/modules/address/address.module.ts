import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";
import { Module } from "@nestjs/common";

@Module({
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {};
