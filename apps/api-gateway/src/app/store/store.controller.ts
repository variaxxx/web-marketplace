import { AccessToken } from "../../common/decorators/access-token.decorator";
import { BaseRpcController } from "../base-rpc.controller";
import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { FindMyStorePayload, FindOneStorePayload, MicroserviceName, SetStorePicturePayload, StoreInfoResponse, USER_PATTERNS } from "@web-marketplace/shared";
import { extname } from "node:path";

@Controller("store")
export class StoreController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {
    super();
  }

  @HttpCode(HttpStatus.OK)
  @Get("my")
  async getMyStore(
    @AccessToken() accessToken: string,
  ): Promise<StoreInfoResponse> {
    return await this.send<FindMyStorePayload, StoreInfoResponse>(
      this.userClient,
      USER_PATTERNS.STORE.GET_MY,
      {
        accessToken,
      },
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async getInfo(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<StoreInfoResponse> {
    return await this.send<FindOneStorePayload, StoreInfoResponse>(
      this.userClient,
      USER_PATTERNS.STORE.GET_INFO,
      {
        ownerId: id,
      },
    );
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
    @AccessToken() accessToken: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<StoreInfoResponse> {
    return await this.send<SetStorePicturePayload, StoreInfoResponse>(
      this.userClient,
      USER_PATTERNS.STORE.SET_STORE_PICTURE,
      {
        accessToken,
        image: {
          buffer: image.buffer,
          mimetype: image.mimetype,
          originalName: image.originalname,
          size: image.size,
        },
      },
    );
  }
}
