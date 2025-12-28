import { AddressService } from "./address.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AddAddressPayload, AddressInfoResponse, DeleteAddressPayload, EditAddressPayload, FindManyAddressesPayload, FindManyApiResponse, FindOneAddressPayload, USER_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  @MessagePattern(USER_PATTERNS.ADDRESS.ADD)
  async add(
    @Payload() payload: AddAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.add(payload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.EDIT)
  async edit(
    @Payload() payload: EditAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.edit(payload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.DELETE)
  async delete(
    @Payload() payload: DeleteAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.delete(payload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneAddressPayload,
  ): Promise<AddressInfoResponse> {
    return await this.addressService.findOne(payload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.FIND_MANY)
  async findMany(
    @Payload() payload: FindManyAddressesPayload,
  ): Promise<FindManyApiResponse<AddressInfoResponse>> {
    return await this.addressService.findMany(payload);
  }
}
