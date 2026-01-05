// import { AllowedRoles } from "../../common/decorators/allowed-roles.decorator";
// import { IsPublic } from "../../common/decorators/is-public.decorator";
// import { UserInfo } from "../../common/decorators/user-info.decorator";
// import { BaseController } from "../base.controller";
// import { HttpService } from "@nestjs/axios";
// import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { ClientProxy } from "@nestjs/microservices";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { AuthTokenPayload, FindMyStorePayload, FindOneStorePayload, MicroserviceName, SetStorePicturePayload, StoreInfoResponse, USER_PATTERNS, USER_ROLE } from "@web-marketplace/shared";
// import { extname } from "node:path";

// @Controller("store")
// export class StoreController extends BaseController {
//   constructor(
//     protected readonly config: ConfigService,
//     protected readonly http: HttpService,
//     @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
//   ) {
//     super(config, http);
//   }

//   @AllowedRoles(USER_ROLE.SELLER)
//   @HttpCode(HttpStatus.OK)
//   @Get("my")
//   async getMyStore(
//     @UserInfo() userInfo: AuthTokenPayload,
//   ): Promise<StoreInfoResponse> {
//     return await this.send<FindMyStorePayload, StoreInfoResponse>(
//       this.userClient,
//       USER_PATTERNS.STORE.GET_MY,
//       {
//         userInfo,
//       },
//     );
//   }

//   @IsPublic()
//   @HttpCode(HttpStatus.OK)
//   @Get(":id")
//   async getInfo(
//     @Param("id") id: string,
//   ): Promise<StoreInfoResponse> {
//     return await this.send<FindOneStorePayload, StoreInfoResponse>(
//       this.userClient,
//       USER_PATTERNS.STORE.GET_INFO,
//       {
//         ownerId: id,
//       },
//     );
//   }

//   @AllowedRoles(USER_ROLE.SELLER)
//   @HttpCode(HttpStatus.OK)
//   @Post("picture")
//   @UseInterceptors(FileInterceptor("image", {
//     limits: {
//       fileSize: 1024 * 1024 * 5,
//     },
//     fileFilter: (req: any, file: any, cb: any) => {
//       if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
//         cb(null, true);
//       } else {
//         cb(new BadRequestException(`Unsupported file type ${extname(file.originalname)}`), false);
//       }
//     },
//   }))
//   async setPfp(
//     @UserInfo() userInfo: AuthTokenPayload,
//     @UploadedFile() image: Express.Multer.File,
//   ): Promise<StoreInfoResponse> {
//     return await this.send<SetStorePicturePayload, StoreInfoResponse>(
//       this.userClient,
//       USER_PATTERNS.STORE.SET_STORE_PICTURE,
//       {
//         userInfo,
//         image: {
//           buffer: image.buffer,
//           mimetype: image.mimetype,
//           originalName: image.originalname,
//           size: image.size,
//         },
//       },
//     );
//   }
// }
