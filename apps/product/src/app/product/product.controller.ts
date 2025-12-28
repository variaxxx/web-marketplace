import { ProductService } from "./product.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { CreateProductPayload, DeleteProductPayload, EditProductPayload, FindManyApiResponse, FindManyProductsPayload, FindMyProductsPayload, FindOneProductPayload, FindProductsByIdsPayload, HideProductPayload, MarkAsSoldProductPayload, PRODUCT_PATTERNS, ProductInfoResponse, PutProductForSalePayload } from "@web-marketplace/shared";

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.CREATE)
  async create(
    @Payload() payload: CreateProductPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.create(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.EDIT)
  async edit(
    @Payload() payload: EditProductPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.edit(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.DELETE)
  async delete(
    @Payload() payload: DeleteProductPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.delete(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.HIDE)
  async hide(
    @Payload() payload: HideProductPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.hide(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.PUT_FOR_SALE)
  async putForSale(
    @Payload() payload: PutProductForSalePayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.putForSale(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.FIND_MY)
  async findMy(
    @Payload() payload: FindMyProductsPayload,
  ): Promise<FindManyApiResponse> {
    return await this.productService.findMy(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneProductPayload,
  ): Promise<ProductInfoResponse> {
    return await this.productService.findOne(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.FIND_MANY)
  async findMany(
    @Payload() payload: FindManyProductsPayload,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    return await this.productService.findMany(payload);
  }

  @EventPattern(PRODUCT_PATTERNS.PRODUCT.MARK_AS_SOLD)
  async markAsSold(
    @Payload() payload: MarkAsSoldProductPayload,
  ): Promise<void> {
    return await this.productService.markAsSold(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.PRODUCT.FIND_BY_IDS)
  async findByIds(
    @Payload() payload: FindProductsByIdsPayload,
  ): Promise<ProductInfoResponse[]> {
    return await this.productService.findByIds(payload);
  }
}
