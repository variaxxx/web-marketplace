import { AccessToken } from "../../common/decorators/access-token.decorator";
import { pictureFileFilter } from "../../common/filters/picture-file.filter";
import { BaseRpcController } from "../base-rpc.controller";
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateProductDto, CreateProductPayload, DeleteProductPayload, EditProductDto, EditProductPayload, FindManyApiResponse, FindManyProductsPayload, FindMyProductsPayload, FindOneProductPayload, HideProductPayload, MicroserviceName, PRODUCT_PATTERNS, ProductInfoResponse, ProductSearchPayload } from "@web-marketplace/shared";

@Controller("product")
export class ProductController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {
    super();
  }

  @Get("search")
  async search(
    @Query("query") query: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @Query("category") category?: string,
    @Query("minPrice") minPrice?: number,
    @Query("maxPrice") maxPrice?: number,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    if (!query)
      throw new BadRequestException("No query provided");

    return await this.send<ProductSearchPayload, FindManyApiResponse<ProductInfoResponse>>(
      this.productClient,
      PRODUCT_PATTERNS.SEARCH,
      { query, limit, category, maxPrice, minPrice, offset },
    );
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
    @Body() dto: CreateProductDto,
    @AccessToken() accessToken: string,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductInfoResponse> {
    if (!images.length) {
      throw new BadRequestException("At least one image required");
    }

    if (images.length > 5) {
      throw new BadRequestException("Max 5 images allowed");
    }

    return await this.send<CreateProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.CREATE,
      {
        ...dto,
        accessToken,
        images: images.map(image => ({
          buffer: image.buffer,
          mimetype: image.mimetype,
          originalName: image.originalname,
          size: image.size,
        })),
      },
    );
  }

  @Get("findMany")
  @HttpCode(HttpStatus.OK)
  async findMany(
    @Query("order") order: "asc" | "desc" = "asc",
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @Query("sellerId") sellerId?: string,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    return await this.send<FindManyProductsPayload, FindManyApiResponse<ProductInfoResponse>>(
      this.productClient,
      PRODUCT_PATTERNS.FIND_MANY,
      { order, limit, offset, sellerId },
    );
  }

  @Get("my")
  @HttpCode(HttpStatus.OK)
  async findMy(
    @Query("order") order: "asc" | "desc" = "asc",
    @AccessToken() accessToken: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    return await this.send<FindMyProductsPayload, FindManyApiResponse<ProductInfoResponse>>(
      this.productClient,
      PRODUCT_PATTERNS.FIND_MY,
      { accessToken, order, limit, offset },
    );
  }

  @Get(":productId")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param("productId") productId: string,
  ): Promise<ProductInfoResponse> {
    return await this.send<FindOneProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.FIND_ONE,
      { id: productId },
    );
  }

  @Patch(":productId")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor("newImages", 5, {
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: pictureFileFilter,
  }))
  async edit(
    @AccessToken() accessToken: string,
    @Param("productId") productId: string,
    @Body() dto: EditProductDto,
    @UploadedFiles() newImages: Express.Multer.File[],
  ): Promise<ProductInfoResponse> {
    return await this.send<EditProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.EDIT,
      {
        ...dto,
        id: productId,
        accessToken,
        newImages: newImages.map(i => ({
          buffer: i.buffer,
          mimetype: i.mimetype,
          originalName: i.originalname,
          size: i.size,
        })),
        existingImages: dto.existingImages ?? [],
      },
    );
  }

  @Delete(":productId")
  @HttpCode(HttpStatus.OK)
  async delete(
    @AccessToken() accessToken: string,
    @Param("productId") productId: string,
  ): Promise<ProductInfoResponse> {
    return await this.send<DeleteProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.DELETE,
      {
        id: productId,
        accessToken,
      },
    );
  }

  @Post(":productId/hide")
  @HttpCode(HttpStatus.NO_CONTENT)
  async hide(
    @AccessToken() accessToken: string,
    @Param("productId") productId: string,
  ): Promise<ProductInfoResponse> {
    return await this.send<HideProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.HIDE,
      {
        id: productId,
        accessToken,
      },
    );
  }
}
