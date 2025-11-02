import { Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { GetMyStorePayload, GetStoreInfoPayload, MicroserviceName, SetStorePicturePayload, StoreInfoResponse, USER_PATTERNS } from "@web-marketplace/shared";
import { Request } from "express";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("store")
export class StoreController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get("my")
  async getMyStore(
    @Req() req: Request,
  ): Promise<StoreInfoResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.GET_MY_STORE, {
      accessToken,
    } as GetMyStorePayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async getInfo(
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<StoreInfoResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.GET_STORE_INFO, {
      accessToken,
      ownerId: id,
    } as GetStoreInfoPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Post("picture")
  @UseInterceptors(FileInterceptor("image"))
  async setPfp(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ): Promise<StoreInfoResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SET_STORE_PICTURE, {
      accessToken,
      image: image.buffer,
    } as SetStorePicturePayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
