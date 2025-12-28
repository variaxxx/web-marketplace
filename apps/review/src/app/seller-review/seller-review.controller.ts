import { SellerReviewService } from "./seller-review.service";
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CreateSellerReviewPayload, REVIEW_PATTERNS, SellerReviewInfoResponse } from "@web-marketplace/shared";

@Controller()
export class SellerReviewController {
  constructor(
    private readonly sellerReviewService: SellerReviewService,
  ) {}

  @MessagePattern(REVIEW_PATTERNS.SELLER_REVIEW.CREATE)
  async create(
    payload: CreateSellerReviewPayload,
  ): Promise<SellerReviewInfoResponse> {
    return await this.sellerReviewService.create(payload);
  }
}
