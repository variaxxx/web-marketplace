import { AddressService } from "./address.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AddAddressPayload, AddressResponse, AuthTokenPayload, DeleteAddressPayload, EditAddressPayload, FindManyAddressesPayload, FindManyApiResponse, FindOneAddressPayload, JwtPayload, USER_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  @MessagePattern(USER_PATTERNS.ADDRESS.ADD)
  async add(
    @Payload() payload: AddAddressPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    return await this.addressService.add(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.EDIT)
  async edit(
    @Payload() payload: EditAddressPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    return await this.addressService.edit(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.DELETE)
  async delete(
    @Payload() payload: DeleteAddressPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    return await this.addressService.delete(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneAddressPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    return await this.addressService.findOne(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.ADDRESS.FIND_MANY)
  async findMany(
    @Payload() payload: FindManyAddressesPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<FindManyApiResponse<AddressResponse>> {
    return await this.addressService.findMany(payload, jwtPayload);
  }
}
