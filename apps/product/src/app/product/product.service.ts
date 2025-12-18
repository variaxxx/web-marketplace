import { PrismaService } from "../../db/prisma.service";
import { SearchService } from "../search/search.service";
import { ProductInfo } from "../search/search.types";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { AuthTokenPayload, CreateProductPayload, FindManyApiResponse, FindManyProductsPayload, FindOneProductPayload, ProductInfoResponse, ProductStatus, UserRole } from "@web-marketplace/shared";

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  private readonly productSelectColumns = {
    id: true,
    createdAt: true,
    updatedAt: true,
    sellerId: true,
    name: true,
    description: true,
    status: true,
    priceCents: true,
    category: true,
  };

  async create(
    payload: CreateProductPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    if (jwtPayload.role !== UserRole.SELLER) {
      throw new RpcException({
        status: 403,
        message: "You are not a seller",
      });
    }

    const product = await this.prisma.product.create({
      data: {
        sellerId: jwtPayload.userId,
        status: ProductStatus.ON_SALE,
        name: payload.name,
        description: payload.description,
        category: payload.category,
        priceCents: payload.priceCents,
      },
      select: this.productSelectColumns,
    });

    await this.searchService.indexProduct(product as ProductInfo);

    return product as ProductInfoResponse;
  }

  async findOne(
    payload: FindOneProductPayload,
  ): Promise<ProductInfoResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
      select: this.productSelectColumns,
    });

    return product as ProductInfoResponse;
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
        select: this.productSelectColumns,
        orderBy: { createdAt: payload.order },
        take: Math.max(0, Math.min(payload.limit, 20)),
        skip: payload.offset,
      }),
      this.prisma.product.count({
        where,
      }),
    ]);

    return {
      total: totalCount,
      count: products.length,
      items: products as ProductInfoResponse[],
    };
  }
}
