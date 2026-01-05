import { CategoryService } from "./category.service";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from "@nestjs/common";
import { CategoryInfoResponse, CreateCategoryPayload, DeleteCategoryPayload, EditCategoryPayload, FindOneCategoryPayload } from "@web-marketplace/shared";

@Controller("category")
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() payload: CreateCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.create(payload);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async edit(
    @Body() payload: EditCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.edit(payload);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Body() payload: DeleteCategoryPayload,
  ): Promise<void> {
    return await this.categoryService.delete(payload);
  }

  @Get("findAll")
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CategoryInfoResponse[]> {
    return await this.categoryService.findAll();
  }

  @Get("findOne")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Body() payload: FindOneCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.categoryService.findOne(payload);
  }
}
