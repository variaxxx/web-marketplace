import { ProductService } from "./product.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthTokenPayload, CreateProductPayload, JwtPayload, PRODUCT_PATTERNS, ProductInfoResponse, RpcAllowedRoles, UserRole } from "@web-marketplace/shared";

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
}
