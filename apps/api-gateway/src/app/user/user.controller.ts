import { IsPublic } from "../../common/decorators/is-public.decorator";
import { UserInfo } from "../../common/decorators/user-info.decorator";
import { pictureFileFilter } from "../../common/filters/picture-file.filter";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { AddAddressDto, AddAddressPayload, AddressInfoResponse, AuthTokenPayload, DeleteAddressPayload, EditAddressDto, EditAddressPayload, EditUserInfoDto, EditUserInfoPayload, FindManyAddressesDto, FindManyAddressesPayload, FindManyApiResponse, FindOneAddressPayload, GetMePayload, GetUserInfoPayload, MicroserviceName, SetProfilePicturePayload, USER_PATTERNS, UserInfoResponse } from "@web-marketplace/shared";

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
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: EditUserInfoDto,
  ): Promise<UserInfoResponse> {
    return await this.send<EditUserInfoPayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.EDIT_INFO,
      {
        userInfo,
        ...dto,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get("me")
  async getMe(
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    return await this.send<GetMePayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.GET_ME,
      {
        userInfo,
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
    @UserInfo() userInfo: AuthTokenPayload,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UserInfoResponse> {
    return await this.send<SetProfilePicturePayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.SET_PROFILE_PICTURE,
      {
        userInfo,
        image: {
          buffer: image.buffer,
          mimetype: image.mimetype,
          originalName: image.originalname,
          size: image.size,
        },
      },
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("address")
  async addAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: AddAddressDto,
  ): Promise<AddressInfoResponse> {
    return await this.send<AddAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.ADD,
      {
        userInfo,
        ...dto,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Patch("address/:id")
  async editAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
    @Body() dto: EditAddressDto,
  ): Promise<AddressInfoResponse> {
    return await this.send<EditAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.EDIT,
      {
        userInfo,
        ...dto,
        addressId: id,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete("address/:id")
  async deleteAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
  ): Promise<AddressInfoResponse> {
    return await this.send<DeleteAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.DELETE,
      {
        userInfo,
        addressId: id,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get("address/:id")
  async findAddress(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
  ): Promise<AddressInfoResponse> {
    return await this.send<FindOneAddressPayload, AddressInfoResponse>(
      this.userClient,
      USER_PATTERNS.ADDRESS.FIND_ONE,
      {
        userInfo,
        addressId: id,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get("addresses")
  async findManyAddresses(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: FindManyAddressesDto,
  ): Promise<FindManyApiResponse<AddressInfoResponse>> {
    return await this.send<FindManyAddressesPayload, FindManyApiResponse<AddressInfoResponse>>(
      this.userClient,
      USER_PATTERNS.ADDRESS.FIND_MANY,
      {
        userInfo,
        ...dto,
      },
    );
  }

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async getInfo(
    @Param("id") id: string,
    @UserInfo(true) userInfo?: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    return await this.send<GetUserInfoPayload, UserInfoResponse>(
      this.userClient,
      USER_PATTERNS.USER.GET_INFO,
      {
        userId: id,
        userInfo,
      },
    );
  }
}
