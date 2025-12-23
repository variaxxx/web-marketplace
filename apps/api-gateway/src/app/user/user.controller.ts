import { AccessToken } from "../../common/decorators/access-token.decorator";
import { pictureFileFilter } from "../../common/filters/picture-file.filter";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { AddAddressDto, AddAddressPayload, AddressInfoResponse, DeleteAddressPayload, EditAddressDto, EditAddressPayload, EditUserInfoDto, EditUserInfoPayload, FindManyAddressesDto, FindManyAddressesPayload, FindManyApiResponse, FindOneAddressPayload, GetMePayload, GetUserInfoPayload, MicroserviceName, SetProfilePicturePayload, USER_PATTERNS, UserInfoResponse } from "@web-marketplace/shared";

@Controller("user")
export class UserController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {
    super();
  }

  @HttpCode(HttpStatus.OK)
  @Patch("me")
  async editInfo(
    @AccessToken() accessToken: string,
    @Body() dto: EditUserInfoDto,
  ): Promise<UserInfoResponse> {
    return await this.send<EditUserInfoPayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.EDIT_INFO,
      {
        accessToken,
        ...dto,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get("me")
  async getMe(
    @AccessToken() accessToken: string,
  ): Promise<UserInfoResponse> {
    return await this.send<GetMePayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.GET_ME,
      {
        accessToken,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post("pfp")
  @UseInterceptors(FileInterceptor("image", {
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: pictureFileFilter,
  }))
  async setPfp(
    @AccessToken() accessToken: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UserInfoResponse> {
    return await this.send<SetProfilePicturePayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.SET_PROFILE_PICTURE,
      {
        accessToken,
        image: image.buffer,
      },
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("address")
  async addAddress(
    @AccessToken() accessToken: string,
    @Body() dto: AddAddressDto,
  ): Promise<AddressInfoResponse> {
    return await this.send<AddAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.ADD,
      {
        accessToken,
        ...dto,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Patch("address/:id")
  async editAddress(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
    @Body() dto: EditAddressDto,
  ): Promise<AddressInfoResponse> {
    return await this.send<EditAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.EDIT,
      {
        accessToken,
        ...dto,
        addressId: id,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete("address/:id")
  async deleteAddress(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<AddressInfoResponse> {
    return await this.send<DeleteAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.DELETE,
      {
        accessToken,
        addressId: id,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get("address/:id")
  async findAddress(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<AddressInfoResponse> {
    return await this.send<FindOneAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.FIND_ONE,
      {
        accessToken,
        addressId: id,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get("addresses")
  async findManyAddresses(
    @AccessToken() accessToken: string,
    @Body() dto: FindManyAddressesDto,
  ): Promise<FindManyApiResponse<AddressInfoResponse>> {
    return await this.send<FindManyAddressesPayload, FindManyApiResponse<AddressInfoResponse>>(
      this.userClient,
      USER_PATTERNS.ADDRESS.FIND_MANY,
      {
        accessToken,
        ...dto,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async getInfo(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<UserInfoResponse> {
    return await this.send<GetUserInfoPayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.GET_INFO,
      {
        userId: id,
        accessToken,
      },
    );
  }
}
