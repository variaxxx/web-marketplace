import { AccessToken } from "../../common/decorators/access-token.decorator";
import { pictureFileFilter } from "../../common/filters/picture-file.filter";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { AddAddressDto, AddAddressPayload, AddressResponse, DeleteAddressPayload, EditAddressDto, EditAddressPayload, EditUserInfoDto, EditUserInfoPayload, FindManyAddressesDto, FindManyAddressesPayload, FindManyApiResponse, FindOneAddressPayload, GetMePayload, GetUserInfoPayload, MicroserviceName, SetProfilePicturePayload, USER_PATTERNS, UserInfoResponse } from "@web-marketplace/shared";
import { catchError, firstValueFrom, throwError } from "rxjs";

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
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.USER.EDIT_INFO, {
      accessToken,
      name: dto.name,
      phone: dto.phone,
    } as EditUserInfoPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Get("me")
  async getMe(
    @AccessToken() accessToken: string,
  ): Promise<UserInfoResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.USER.GET_ME, {
      accessToken,
    } as GetMePayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
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
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.USER.SET_PROFILE_PICTURE, {
      accessToken,
      image: image.buffer,
    } as SetProfilePicturePayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("address")
  async addAddress(
    @AccessToken() accessToken: string,
    @Body() dto: AddAddressDto,
  ): Promise<AddressResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.ADDRESS.ADD, {
      accessToken,
      ...dto,
    } as AddAddressPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Patch("address/:id")
  async editAddress(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
    @Body() dto: EditAddressDto,
  ): Promise<AddressResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.ADDRESS.EDIT, {
      ...dto,
      accessToken,
      addressId: id,
    } as EditAddressPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Delete("address/:id")
  async deleteAddress(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<AddressResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.ADDRESS.DELETE, {
      accessToken,
      addressId: id,
    } as DeleteAddressPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Get("address/:id")
  async findAddress(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<AddressResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.ADDRESS.FIND_ONE, {
      accessToken,
      addressId: id,
    } as FindOneAddressPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Get("addresses")
  async findManyAddresses(
    @AccessToken() accessToken: string,
    @Body() dto: FindManyAddressesDto,
  ): Promise<FindManyApiResponse<AddressResponse>> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.ADDRESS.FIND_MANY, {
      ...dto,
      accessToken,
    } as FindManyAddressesPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async getInfo(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<UserInfoResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.USER.GET_INFO, {
      accessToken,
      userId: id,
    } as GetUserInfoPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
