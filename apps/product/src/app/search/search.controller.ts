import { SearchService } from "./search.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { FindManyApiResponse, IsPublic, PRODUCT_PATTERNS, ProductInfoResponse, ProductSearchPayload } from "@web-marketplace/shared";

@Controller()
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @IsPublic()
  @MessagePattern(PRODUCT_PATTERNS.SEARCH)
  async search(
    @Payload() payload: ProductSearchPayload,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    return await this.searchService.searchProducts(payload);
  }
}
