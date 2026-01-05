import { AddressService } from "./address.service";
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { AddAddressPayload, AddressInfoResponse, DeleteAddressPayload, EditAddressPayload, FindManyAddressesPayload, FindManyAddressesResponse, FindOneAddressPayload } from "@web-marketplace/contracts/gen/address";

@Controller()
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.ADDRESS_SERVICE, "Add")
  async add(
    payload: AddAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.add(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ADDRESS_SERVICE, "Edit")
  async edit(
    payload: EditAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.edit(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ADDRESS_SERVICE, "Delete")
  async delete(
    payload: DeleteAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.delete(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ADDRESS_SERVICE, "FindOne")
  async findOne(
    payload: FindOneAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.findOne(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ADDRESS_SERVICE, "FindMany")
  async findMany(
    payload: FindManyAddressesPayload,
  ): Promise<FindManyAddressesResponse> {
    return await this.addressService.findMany(payload);
  }
}
