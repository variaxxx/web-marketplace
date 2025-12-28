import { PrismaService } from "../../db/prisma.service";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { AddWishlistItemPayload, FindManyApiResponse, FindManyWishlistItemsPayload, FindOneProductPayload, MicroserviceName, PrismaQueryError, PRODUCT_PATTERNS, PRODUCT_STATUS, ProductInfoResponse, ProductStatusChangedPayload, RemoveWishlistItemPayload } from "@web-marketplace/shared";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  async addItem(
    payload: AddWishlistItemPayload,
  ): Promise<void> {
    const product = await firstValueFrom(this.productClient.send<ProductInfoResponse, FindOneProductPayload>(
      PRODUCT_PATTERNS.PRODUCT.FIND_ONE,
      { id: payload.productId },
    ).pipe(
      catchError(err => throwError(() => new RpcException(err))),
    ));

    return void await this.prisma.wishlistItem.create({
      data: {
        userId: payload.userInfo.userId,
        productId: payload.productId,
        productStatus: product.status,
      },
    }).catch((e) => {
      if (e.code !== PrismaQueryError.UniqueConstraintViolation) {
        throw e;
      }
    });
  }

  async findItems(
    payload: FindManyWishlistItemsPayload,
  ): Promise<FindManyApiResponse<string>> {
    const where = {
      userId: payload.userInfo.userId,
      productStatus: { in: [PRODUCT_STATUS.ON_SALE, PRODUCT_STATUS.SOLD] },
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.wishlistItem.findMany({
        where,
        select: { productId: true },
        take: payload.limit ? Math.max(0, Math.min(20, payload.limit)) : undefined,
        skip: payload.offset && payload.offset > 0 ? payload.offset : undefined,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.wishlistItem.count({ where }),
    ]);

    return {
      count: items.length,
      total,
      items: items.map(i => i.productId),
    };
  }

  async removeItem(
    payload: RemoveWishlistItemPayload,
  ): Promise<void> {
    return void await this.prisma.wishlistItem.delete({
      where: {
        productId_userId: {
          productId: payload.productId,
          userId: payload.userInfo.userId,
        },
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound) {
        throw new RpcException({
          status: 400,
          message: "Product is not in your wishlist",
        });
      }
    });
  }

  async productStatusChanged(
    payload: ProductStatusChangedPayload,
  ): Promise<void> {
    await this.prisma.wishlistItem.updateMany({
      where: { productId: payload.productId },
      data: {
        productStatus: payload.newStatus,
      },
    });
  }
}
