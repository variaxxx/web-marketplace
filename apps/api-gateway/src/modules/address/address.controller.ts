import { ApiFormattedFindManyResponse, ApiFormattedResponse, UserInfo } from "../../shared";
import { AddressClientGrpc } from "./address.grpc";
import { AddAddressRequest, AddressInfoResponse, EditAddressRequest } from "./dto";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { FindManyApiResponse } from "@web-marketplace/api";
import { AuthTokenPayload } from "@web-marketplace/backend";
import { AddressInfoResponse as AddressInfoGrpcResponse } from "@web-marketplace/contracts/gen/address";

@Controller("addresses")
export class AddressController {
  private toResponseDto(
    address: AddressInfoGrpcResponse,
  ): AddressInfoResponse {
    return {
      ...address,
      createdAt: new Date(Number(address.createdAt.seconds) * 1000),
      label: address.label ?? null,
    };
  }

  constructor(
    private readonly client: AddressClientGrpc,
  ) {}

  @ApiOperation({
    summary: "Receiving multiple addresses",
  })
  @ApiQuery({
    name: "limit",
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: "offset",
    type: Number,
    required: false,
  })
  @ApiFormattedFindManyResponse(
    HttpStatus.CREATED,
    AddressInfoResponse,
    "FindManyAddressesResponse",
  )
  @HttpCode(HttpStatus.OK)
  @Get()
  async findManyAddresses(
    @UserInfo() userInfo: AuthTokenPayload,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<FindManyApiResponse<AddressInfoResponse>> {
    const res = await this.client.call("findMany", {
      userInfo,
      offset,
      limit,
    });

    return {
      ...res,
      items: res.items ? res.items.map(i => this.toResponseDto(i)) : [],
    };
  }

  @ApiOperation({
    summary: "Adding an address",
  })
  @ApiFormattedResponse(HttpStatus.CREATED, AddressInfoResponse)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async addAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: AddAddressRequest,
  ): Promise<AddressInfoResponse> {
    const res = await this.client.call("add", {
      userInfo,
      ...dto,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({
    summary: "Change of address",
  })
  @ApiFormattedResponse(HttpStatus.OK, AddressInfoResponse)
  @HttpCode(HttpStatus.OK)
  @Patch(":id")
  async editAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
    @Body() dto: EditAddressRequest,
  ): Promise<AddressInfoResponse> {
    const res = await this.client.call("edit", {
      userInfo,
      addressId: id,
      ...dto,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({
    summary: "Deleting an address",
  })
  @ApiFormattedResponse(HttpStatus.OK, AddressInfoResponse)
  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async deleteAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
  ): Promise<AddressInfoResponse> {
    const res = await this.client.call("delete", {
      userInfo,
      addressId: id,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({
    summary: "Getting an address by ID",
  })
  @ApiFormattedResponse(HttpStatus.OK, AddressInfoResponse)
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async findAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
  ): Promise<AddressInfoResponse> {
    const res = await this.client.call("findOne", {
      userInfo,
      addressId: id,
    });

    return this.toResponseDto(res);
  }
}
