import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { EditUserInfoDto, EditUserInfoPayload, GetMePayload, GetUserInfoPayload, MicroserviceName, SetProfilePicturePayload, USER_PATTERNS, UserInfoResponse } from "@web-marketplace/shared";
import { Request } from "express";
import { Multer } from "multer";
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

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.EDIT_USER_INFO, {
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

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.GET_ME, {
      accessToken,
    } as GetMePayload).pipe(
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

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.GET_USER_INFO, {
      accessToken,
      userId: id,
    } as GetUserInfoPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Post("pfp")
  @UseInterceptors(FileInterceptor("image"))
  async setPfp(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ): Promise<UserInfoResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SET_PROFILE_PICTURE, {
      accessToken,
      image: image.buffer,
    } as SetProfilePicturePayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
