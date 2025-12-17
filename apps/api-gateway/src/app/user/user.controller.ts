import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { AddAddressDto, AddAddressPayload, AddressResponse, DeleteAddressPayload, EditAddressDto, EditAddressPayload, EditUserInfoDto, EditUserInfoPayload, FindManyAddressesDto, FindManyAddressesPayload, FindManyApiResponse, FindOneAddressPayload, GetMePayload, GetUserInfoPayload, MicroserviceName, SetProfilePicturePayload, USER_PATTERNS, UserInfoResponse } from "@web-marketplace/shared";
import { Request } from "express";
import { extname } from "node:path";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("user")
export class UserController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Patch("me")
  async editInfo(
    @Req() req: Request,
    @Body() dto: EditUserInfoDto,
  ): Promise<UserInfoResponse> {
    const accessToken = req.cookies.accessToken;

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
    @Req() req: Request,
  ): Promise<UserInfoResponse> {
    const accessToken = req.cookies.accessToken;

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
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(`Unsupported file type ${extname(file.originalname)}`), false);
      }
    },
  }))
  async setPfp(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ): Promise<UserInfoResponse> {
    const accessToken = req.cookies.accessToken;

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
    @Body() dto: AddAddressDto,
    @Req() req: Request,
  ): Promise<AddressResponse> {
    const accessToken = req.cookies.accessToken;

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
    @Param("id") id: string,
    @Body() dto: EditAddressDto,
    @Req() req: Request,
  ): Promise<AddressResponse> {
    const accessToken = req.cookies.accessToken;

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
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<AddressResponse> {
    const accessToken = req.cookies.accessToken;

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
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<AddressResponse> {
    const accessToken = req.cookies.accessToken;

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
    @Body() dto: FindManyAddressesDto,
    @Req() req: Request,
  ): Promise<FindManyApiResponse<AddressResponse>> {
    const accessToken = req.cookies.accessToken;

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
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<UserInfoResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.USER.GET_INFO, {
      accessToken,
      userId: id,
    } as GetUserInfoPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
