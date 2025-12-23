import { ProductService } from "./product.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AuthTokenPayload, CreateProductPayload, DeleteProductPayload, EditProductPayload, FindManyApiResponse, FindManyProductsPayload, FindMyProductsPayload, FindOneProductPayload, HideProductPayload, IsPublic, JwtPayload, MarkAsSoldProductPayload, PRODUCT_PATTERNS, ProductInfoResponse, RpcAllowedRoles, UserRole } from "@web-marketplace/shared";

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.CREATE)
  async create(
    @Payload() payload: CreateProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.create(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.EDIT)
  async edit(
    @Payload() payload: EditProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.edit(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.DELETE)
  async delete(
    @Payload() payload: DeleteProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.delete(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.HIDE)
  async hide(
    @Payload() payload: HideProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.hide(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.FIND_MY)
  async findMy(
    @Payload() payload: FindMyProductsPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<FindManyApiResponse> {
    return await this.productService.findMy(payload, jwtPayload);
  }

  @IsPublic()
  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneProductPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.findOne(payload);
  }

  @IsPublic()
  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.FIND_MANY)
  async findMany(
    @Payload() payload: FindManyProductsPayload,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    return await this.productService.findMany(payload);
  }

  @IsPublic()
  @EventPattern(PRODUCT_PATTERNS.PRODUCT.MARK_AS_SOLD)
  async markAsSold(
    @Payload() payload: MarkAsSoldProductPayload,
  ): Promise<void> {
    return await this.productService.markAsSold(payload);
  }
}
