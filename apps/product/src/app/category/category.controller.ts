import { CategoryService } from "./category.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CategoryInfoResponse, CreateCategoryPayload, DeleteCategoryPayload, EditCategoryPayload, FindOneCategoryPayload, PRODUCT_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.CREATE)
  async create(
    @Payload() payload: CreateCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.create(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.EDIT)
  async edit(
    @Payload() payload: EditCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.edit(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.DELETE)
  async delete(
    @Payload() payload: DeleteCategoryPayload,
  ): Promise<void> {
    return await this.categoryService.delete(payload);
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.FIND_ALL)
  async findAll(): Promise<CategoryInfoResponse[]> {
    return await this.categoryService.findAll();
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.findOne(payload);
  }
}
