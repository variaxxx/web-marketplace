import { MinioService } from "../../db/minio.service";
import { PrismaService } from "../../db/prisma.service";
import { SearchService } from "../search/search.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Prisma } from "@prisma/generated/productClient";
import { AuthTokenPayload, CreateProductPayload, DeleteProductPayload, EditProductPayload, FindManyApiResponse, FindManyProductsPayload, FindMyProductsPayload, FindOneProductPayload, HideProductPayload, MarkAsSoldProductPayload, normalizeText, PRODUCT_STATUS, ProductInfoResponse } from "@web-marketplace/shared";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

const productSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  sellerId: true,
  name: true,
  description: true,
  status: true,
  priceCents: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  productPictures: {
    select: { url: true },
  },
};

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly picturesBucketName = "products";

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly minio: MinioService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.minio.createBucket(this.picturesBucketName);
  }

  private toResponse(
    product: Prisma.ProductGetPayload<{ select: typeof productSelect }>,
  ): ProductInfoResponse {
    return {
      id: product.id,
      name: product.name,
      categoryName: product.category.name,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      status: product.status,
      description: product.description,
      priceCents: product.priceCents,
      sellerId: product.sellerId,
      pictureUrls: product.productPictures.map(i => i.url),
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

  private handleCategoryFKConstraint(e: any): never {
    if (e.code === "P2003") {
      throw new RpcException({
        status: 400,
        message: "Category not found",
      });
    }
    throw e;
  }

  async create(
    payload: CreateProductPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    const files: {
      url: string;
      sizeBytes: number;
      mimeType: string;
      isMain: boolean;
      order: number;
    }[] = [];

    for (let i = 0; i < payload.images.length; i++) {
      const image = payload.images[i];

      const filename = await this.minio.upload(
        this.picturesBucketName,
        randomUUID(),
        Buffer.from(image.buffer),
      );

      files.push({
        url: `${this.picturesBucketName}/${filename}`,
        sizeBytes: image.size,
        isMain: i === 0,
        mimeType: image.mimetype,
        order: i,
      });
    }

    const product = await this.prisma.product.create({
      data: {
        sellerId: jwtPayload.userId,
        status: PRODUCT_STATUS.ON_SALE,
        name: normalizeText(payload.name, "name"),
        description: normalizeText(payload.description, "description"),
        categoryId: payload.categoryId,
        priceCents: payload.priceCents,
        productPictures: {
          createMany: {
            data: files,
          },
        },
      },
      select: productSelect,
    }).catch(this.handleCategoryFKConstraint);

    await this.searchService.indexProduct(product);

    return this.toResponse(product);
  }

  async findOne(
    payload: FindOneProductPayload,
  ): Promise<ProductInfoResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
      select: productSelect,
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
        select: productSelect,
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
    if (payload.existingImages.length + payload.newImages.length > 5) {
      throw new RpcException({
        status: 400,
        message: "Max 5 pictures allowed",
      });
    }

    const files: {
      url: string;
      sizeBytes: number;
      mimeType: string;
      isMain?: boolean;
      order?: number;
    }[] = [];

    for (const image of payload.newImages) {
      const filename = await this.minio.upload(
        this.picturesBucketName,
        randomUUID(),
        Buffer.from(image.buffer),
      );

      files.push({
        url: `${this.picturesBucketName}/${filename}`,
        sizeBytes: image.size,
        mimeType: image.mimetype,
        isMain: undefined,
        order: undefined,
      });
    }

    const oldPictures = await this.prisma.productPicture.findMany({ where: { productId: payload.id } });

    let lastFile = 0;
    let lastOrder = 0;
    for (let i = 0; i < 5; i++) {
      if (
        lastFile < files.length
        && (
          !oldPictures[i]
          || !payload.existingImages.includes(oldPictures[i].url,
          )
        )
      ) {
        files[lastFile].order = oldPictures[i].order ?? lastOrder + 1;
        files[lastFile++].isMain = oldPictures[i].isMain ?? false;
        lastOrder = files[lastFile].order;
      }
    }

    const product = await this.prisma.product.update({
      where: {
        sellerId: jwtPayload.userId,
        id: payload.id,
      },
      data: {
        name: payload.name ? normalizeText(payload.name, "name") : undefined,
        description: payload.description ? normalizeText(payload.description, "description") : undefined,
        categoryId: payload.categoryId,
        priceCents: payload.priceCents,
        productPictures: {
          deleteMany: {
            url: { notIn: payload.existingImages.concat(files.map(i => i.url)) },
          },
          createMany: {
            data: files,
          },
        },
      },
      select: productSelect,
    }).catch(this.handleNotFound);

    // for (const image of payload.existingImages) {
    //   await this.minio.remove(
    //     image.split("/")[0],
    //     image.split("/")[1],
    //   );
    // }

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
      select: productSelect,
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
      select: productSelect,
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
      select: productSelect,
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
        select: productSelect,
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
}
