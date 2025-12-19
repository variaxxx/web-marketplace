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
  @MessagePattern(PRODUCT_PATTERNS.CREATE)
  async create(
    @Payload() payload: CreateProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.create(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.EDIT)
  async edit(
    @Payload() payload: EditProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.edit(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.DELETE)
  async delete(
    @Payload() payload: DeleteProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.delete(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.HIDE)
  async hide(
    @Payload() payload: HideProductPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.hide(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(PRODUCT_PATTERNS.FIND_MY)
  async findMy(
    @Payload() payload: FindMyProductsPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<FindManyApiResponse> {
    return await this.productService.findMy(payload, jwtPayload);
  }

  @IsPublic()
  @MessagePattern(PRODUCT_PATTERNS.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneProductPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.findOne(payload);
  }

  @IsPublic()
  @MessagePattern(PRODUCT_PATTERNS.FIND_MANY)
  async findMany(
    @Payload() payload: FindManyProductsPayload,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    return await this.productService.findMany(payload);
  }

  @IsPublic()
  @EventPattern(PRODUCT_PATTERNS.MARK_AS_SOLD)
  async markAsSold(
    @Payload() payload: MarkAsSoldProductPayload,
  ): Promise<void> {
    return await this.productService.markAsSold(payload);
  }
}
