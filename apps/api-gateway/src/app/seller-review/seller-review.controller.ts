import { UserInfo } from "../../common/decorators/user-info.decorator";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AuthTokenPayload, CreateSellerReviewDto, CreateSellerReviewPayload, MicroserviceName, REVIEW_PATTERNS, SellerReviewInfoResponse } from "@web-marketplace/shared";
import { pictureFileFilter } from "../../common/filters/picture-file.filter";

@Controller("sellerReview")
export class SellerReviewController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.REVIEW_SERVICE) private readonly reviewClient: ClientProxy,
  ) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor("image", 5, {
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
      fileFilter: pictureFileFilter,
    }))
  async create(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: CreateSellerReviewDto,
  ): Promise<SellerReviewInfoResponse> {
    return await this.send<CreateSellerReviewPayload, SellerReviewInfoResponse>(
      this.reviewClient,
      REVIEW_PATTERNS.SELLER_REVIEW.CREATE,
      {
        userInfo,
        images: ,
        ...dto,
      },
    );
  }
}
