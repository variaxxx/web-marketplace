import { PrismaService } from "../../db/prisma.service";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/generated/reviewClient";
import { CreateSellerReviewPayload, SellerReviewInfoResponse } from "@web-marketplace/shared";

const sellerReviewSelect = {
  id: true,
  createdAt: true,
  rating: true,
  comment: true,
  sellerId: true,
  relatedProductId: true,
  relatedProductName: true,
  sellerReviewImages: {
    select: { url: true },
  },
};

@Injectable()
export class SellerReviewService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private toResponse(
    review: Prisma.SellerReviewGetPayload<{ select: typeof sellerReviewSelect }>,
  ): SellerReviewInfoResponse {
    return {
      id: review.id,
      createdAt: review.createdAt,
      rating: review.rating,
      comment: review.comment,
      sellerId: review.sellerId,
      relatedProductId: review.relatedProductId,
      relatedProductName: review.relatedProductName,
      pictureUrls: review.sellerReviewImages.map(i => i.url),
    };
  }

  async create(
    payload: CreateSellerReviewPayload,
  ): Promise<SellerReviewInfoResponse> {
    const [ratingStat, review] = await this.prisma.$transaction([
      this.prisma.sellerRating.upsert({
        create: {
          sellerId: payload.sellerId,
          count: 1,
          sum: payload.rating,
        },
        where: { sellerId: payload.sellerId },
        update: {
          count: { increment: 1 },
          sum: { increment: payload.rating },
        },
      }),
      this.prisma.sellerReview.create({
        data: {
          rating: payload.rating,
          comment: payload.comment.trim() || "",
          sellerId: payload.sellerId,
          relatedProductId: payload.relatedProductId,
          sellerReviewImages: {
            createMany: {
              data: payload.images.map(i => ({
                url: i.url,
                mimeType: i.mimetype,
                sizeBytes: i.size,
              })),
            },
          },
        },
        select: sellerReviewSelect,
      }),
    ]);

    return this.toResponse(review);
  };

  // async edit(
  //   payload: EditSellerReviewPayload,
  // ): Promise<SellerReviewInfoResponse> {

  // }

  // async findMany()

  // async delete()

  // async findOne()
}
