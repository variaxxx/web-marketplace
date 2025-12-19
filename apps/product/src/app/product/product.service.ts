import { PrismaService } from "../../db/prisma.service";
import { SearchService } from "../search/search.service";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Prisma } from "@prisma/generated/productClient";
import { AuthTokenPayload, CreateProductPayload, DeleteProductPayload, EditProductPayload, FindManyApiResponse, FindManyProductsPayload, FindMyProductsPayload, FindOneProductPayload, HideProductPayload, MarkAsSoldProductPayload, PRODUCT_STATUS, ProductInfoResponse } from "@web-marketplace/shared";

const select = {
  id: true,
  createdAt: true,
  updatedAt: true,
  sellerId: true,
  name: true,
  description: true,
  status: true,
  priceCents: true,
  category: true,
  productPictures: {
    select: { url: true },
  },
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  private normalizeText(
    value: string,
    field: string,
  ): string {
    const v = value.trim();
    if (!v.length) {
      throw new RpcException({
        status: 403,
        message: `Invalid ${field}`,
      });
    }
    return v;
  }

  private toResponse(
    product: Prisma.ProductGetPayload<{ select: typeof select }>,
  ): ProductInfoResponse {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      status: product.status,
      description: product.description,
      priceCents: product.priceCents,
      sellerId: product.sellerId,
      pictureUrls: product.productPictures.map(i => i.url),
    };
  }

  // TODO: upload pictures to minio and db
  async create(
    payload: CreateProductPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    const product = await this.prisma.product.create({
      data: {
        sellerId: jwtPayload.userId,
        status: PRODUCT_STATUS.ON_SALE,
        name: this.normalizeText(payload.name, "name"),
        description: this.normalizeText(payload.description, "description"),
        category: payload.category,
        priceCents: payload.priceCents,
      },
      select,
    });

    await this.searchService.indexProduct(product);

    return this.toResponse(product);
  }

  async findOne(
    payload: FindOneProductPayload,
  ): Promise<ProductInfoResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
      select,
    });

    if (!product) {
      throw new RpcException({
        status: 404,
        message: "Product not found",
      });
    }

    return this.toResponse(product);
  }

  async findMany(
    payload: FindManyProductsPayload,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    const where: any = {};

    if (payload.sellerId)
      where.sellerId = payload.sellerId;

    const [products, totalCount] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select,
        orderBy: { createdAt: payload.order },
        take: payload.limit ? Math.max(0, Math.min(payload.limit, 20)) : undefined,
        skip: payload.offset ?? 0,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      total: totalCount,
      count: products.length,
      items: products.map(this.toResponse),
    };
  }

  async edit(
    payload: EditProductPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    const product = await this.prisma.product.update({
      where: {
        sellerId: jwtPayload.userId,
        id: payload.id,
      },
      data: {
        name: this.normalizeText(payload.name, "name"),
        description: this.normalizeText(payload.description, "description"),
        category: payload.category,
        priceCents: payload.priceCents,
      },
      select,
    }).catch(this.handleNotFound);

    await this.searchService.indexProduct(product);

    return this.toResponse(product);
  }

  async delete(
    payload: DeleteProductPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    const product = await this.prisma.product.update({
      where: {
        sellerId: jwtPayload.userId,
        id: payload.id,
      },
      data: {
        status: PRODUCT_STATUS.REMOVED,
      },
      select,
    }).catch(this.handleNotFound);

    await this.searchService.indexProduct(product);

    return this.toResponse(product);
  }

  async markAsSold(
    payload: MarkAsSoldProductPayload,
  ): Promise<void> {
    const product = await this.prisma.product.update({
      where: { id: payload.productId },
      data: { status: PRODUCT_STATUS.SOLD },
      select,
    }).catch(this.handleNotFound);

    await this.searchService.indexProduct(product);
  }

  async hide(
    payload: HideProductPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    const product = await this.prisma.product.update({
      where: {
        id: payload.id,
        sellerId: jwtPayload.userId,
      },
      data: { status: PRODUCT_STATUS.HIDDEN },
      select,
    }).catch(this.handleNotFound);

    await this.searchService.indexProduct(product);

    return this.toResponse(product);
  }

  async findMy(
    payload: FindMyProductsPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    const where = {
      sellerId: jwtPayload.userId,
      status: { in: [PRODUCT_STATUS.ON_SALE, PRODUCT_STATUS.SOLD, PRODUCT_STATUS.HIDDEN] },
    };

    const [products, totalCount] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select,
        orderBy: { createdAt: payload.order },
        take: payload.limit ? Math.max(0, Math.min(payload.limit, 20)) : undefined,
        skip: payload.offset ?? 0,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      total: totalCount,
      count: products.length,
      items: products.map(this.toResponse),
    };
  }

  private handleNotFound(e: any): never {
    if (e.code === "P2025") {
      throw new RpcException({
        status: 404,
        message: "Product not found",
      });
    }
    throw e;
  }
}
