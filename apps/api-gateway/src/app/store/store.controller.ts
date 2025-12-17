import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { GetMyStorePayload, GetStoreInfoPayload, MicroserviceName, SetStorePicturePayload, StoreInfoResponse, USER_PATTERNS } from "@web-marketplace/shared";
import { Request } from "express";
import { extname } from "node:path";
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

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.STORE.GET_MY, {
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

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.STORE.GET_INFO, {
      accessToken,
      ownerId: id,
    } as GetStoreInfoPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @HttpCode(HttpStatus.OK)
  @Post("picture")
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
  ): Promise<StoreInfoResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.STORE.SET_STORE_PICTURE, {
      accessToken,
      image: image.buffer,
    } as SetStorePicturePayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
