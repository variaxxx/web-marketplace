// import { UserInfo } from "../../common/decorators/user-info.decorator";
// import { BaseController } from "../base.controller";
// import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseInterceptors } from "@nestjs/common";
// import { ClientProxy } from "@nestjs/microservices";
// import { FilesInterceptor } from "@nestjs/platform-express";
// import { AuthTokenPayload, CreateSellerReviewDto, CreateSellerReviewPayload, MicroserviceName, REVIEW_PATTERNS, SellerReviewInfoResponse } from "@web-marketplace/shared";
// import { pictureFileFilter } from "../../common/filters/picture-file.filter";
// import { ConfigService } from "@nestjs/config";
// import { HttpService } from "@nestjs/axios";

// @Controller("sellerReview")
// export class SellerReviewController extends BaseController {
//   constructor(
//     protected readonly config: ConfigService,
//     protected readonly http: HttpService,
//     @Inject(MicroserviceName.REVIEW_SERVICE) private readonly reviewClient: ClientProxy,
//   ) {
//     super(config, http);
//   }

//   // @Post()
//   // @HttpCode(HttpStatus.CREATED)
//   // @UseInterceptors(FilesInterceptor("image", 5, {
//   //     limits: {
//   //       fileSize: 1024 * 1024 * 5,
//   //     },
//   //     fileFilter: pictureFileFilter,
//   //   }))
//   // async create(
//   //   @UserInfo() userInfo: AuthTokenPayload,
//   //   @Body() dto: CreateSellerReviewDto,
//   // ): Promise<SellerReviewInfoResponse> {
//   //   return await this.send<CreateSellerReviewPayload, SellerReviewInfoResponse>(
//   //     this.reviewClient,
//   //     REVIEW_PATTERNS.SELLER_REVIEW.CREATE,
//   //     {
//   //       userInfo,
//   //       images: ,
//   //       ...dto,
//   //     },
//   //   );
//   // }
// }
