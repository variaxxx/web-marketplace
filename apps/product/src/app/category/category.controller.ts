import { CategoryService } from "./category.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CategoryInfoResponse, CreateCategoryPayload, DeleteCategoryPayload, EditCategoryPayload, FindOneCategoryPayload, IsPublic, PRODUCT_PATTERNS, RpcAllowedRoles, UserRole } from "@web-marketplace/shared";

@Controller()
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @RpcAllowedRoles(UserRole.ADMIN)
  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.CREATE)
  async create(
    @Payload() payload: CreateCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.create(payload);
  }

  @RpcAllowedRoles(UserRole.ADMIN)
  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.EDIT)
  async edit(
    @Payload() payload: EditCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.edit(payload);
  }

  @RpcAllowedRoles(UserRole.ADMIN)
  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.DELETE)
  async delete(
    @Payload() payload: DeleteCategoryPayload,
  ): Promise<void> {
    return await this.categoryService.delete(payload);
  }

  @IsPublic()
  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.FIND_ALL)
  async findAll(): Promise<CategoryInfoResponse[]> {
    return await this.categoryService.findAll();
  }

  @IsPublic()
  @MessagePattern(PRODUCT_PATTERNS.CATEGORY.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.findOne(payload);
  }
}
