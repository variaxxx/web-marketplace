import { AllowedRoles } from "../../common/decorators/allowed-roles.decorator";
import { IsPublic } from "../../common/decorators/is-public.decorator";
import { UserInfo } from "../../common/decorators/user-info.decorator";
import { pictureFileFilter } from "../../common/filters/picture-file.filter";
import { BaseRpcController } from "../base-rpc.controller";
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AuthTokenPayload, CreateProductDto, CreateProductPayload, DeleteProductPayload, EditProductDto, EditProductPayload, FindManyApiResponse, FindManyProductsPayload, FindMyProductsPayload, FindOneProductPayload, HideProductPayload, MicroserviceName, PRODUCT_PATTERNS, ProductInfoResponse, ProductSearchPayload, PutProductForSalePayload, USER_ROLE } from "@web-marketplace/shared";

@Controller("product")
export class ProductController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {
    super();
  }

  @IsPublic()
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
      PRODUCT_PATTERNS.PRODUCT.SEARCH,
      { query, limit, category, maxPrice, minPrice, offset },
    );
  }

  @AllowedRoles(USER_ROLE.SELLER)
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
    @UserInfo() userInfo: AuthTokenPayload,
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
      PRODUCT_PATTERNS.PRODUCT.CREATE,
      {
        ...dto,
        userInfo,
        images: images.map(image => ({
          buffer: image.buffer,
          mimetype: image.mimetype,
          originalName: image.originalname,
          size: image.size,
        })),
      },
    );
  }

  @IsPublic()
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
      PRODUCT_PATTERNS.PRODUCT.FIND_MANY,
      { order, limit, offset, sellerId },
    );
  }

  @AllowedRoles(USER_ROLE.SELLER)
  @Get("my")
  @HttpCode(HttpStatus.OK)
  async findMy(
    @Query("order") order: "asc" | "desc" = "asc",
    @UserInfo() userInfo: AuthTokenPayload,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    return await this.send<FindMyProductsPayload, FindManyApiResponse<ProductInfoResponse>>(
      this.productClient,
      PRODUCT_PATTERNS.PRODUCT.FIND_MY,
      { userInfo, order, limit, offset },
    );
  }

  @IsPublic()
  @Get(":productId")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param("productId") productId: string,
  ): Promise<ProductInfoResponse> {
    return await this.send<FindOneProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.PRODUCT.FIND_ONE,
      { id: productId },
    );
  }

  @AllowedRoles(USER_ROLE.SELLER)
  @Patch(":productId")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor("newImages", 5, {
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: pictureFileFilter,
  }))
  async edit(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("productId") productId: string,
    @Body() dto: EditProductDto,
    @UploadedFiles() newImages: Express.Multer.File[],
  ): Promise<ProductInfoResponse> {
    return await this.send<EditProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.PRODUCT.EDIT,
      {
        ...dto,
        id: productId,
        userInfo,
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

  @AllowedRoles(USER_ROLE.SELLER)
  @Delete(":productId")
  @HttpCode(HttpStatus.OK)
  async delete(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("productId") productId: string,
  ): Promise<ProductInfoResponse> {
    return await this.send<DeleteProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.PRODUCT.DELETE,
      {
        id: productId,
        userInfo,
      },
    );
  }

  @AllowedRoles(USER_ROLE.SELLER)
  @Post(":productId/hide")
  @HttpCode(HttpStatus.OK)
  async hide(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("productId") productId: string,
  ): Promise<ProductInfoResponse> {
    return await this.send<HideProductPayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.PRODUCT.HIDE,
      {
        id: productId,
        userInfo,
      },
    );
  }

  @AllowedRoles(USER_ROLE.SELLER)
  @Post(":productId/putForSale")
  @HttpCode(HttpStatus.OK)
  async putForSale(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("productId") productId: string,
  ): Promise<ProductInfoResponse> {
    return await this.send<PutProductForSalePayload, ProductInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.PRODUCT.PUT_FOR_SALE,
      {
        productId,
        userInfo,
      },
    );
  }
}
