import { AccessToken } from "../../common/decorators/access-token.decorator";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CategoryInfoResponse, CreateCategoryDto, CreateCategoryPayload, DeleteCategoryDto, DeleteCategoryPayload, EditCategoryDto, EditCategoryPayload, FindOneCategoryPayload, MicroserviceName, PRODUCT_PATTERNS } from "@web-marketplace/shared";

@Controller("category")
export class CategoryController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {
    super();
  }

  @Post()
  async create(
    @Body() dto: CreateCategoryDto,
    @AccessToken() accessToken: string,
  ): Promise<CategoryInfoResponse> {
    return await this.send<CreateCategoryPayload, CategoryInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.CREATE,
      {
        accessToken,
        ...dto,
      },
    );
  }

  @Patch(":categoryId")
  @HttpCode(HttpStatus.OK)
  async edit(
    @Body() dto: EditCategoryDto,
    @Param("categoryId") categoryId: string,
    @AccessToken() accessToken: string,
  ): Promise<CategoryInfoResponse> {
    return await this.send<EditCategoryPayload, CategoryInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.EDIT,
      {
        accessToken,
        categoryId,
        ...dto,
      },
    );
  }

  @Delete(":categoryId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("categoryId") categoryId: string,
    @Body() dto: DeleteCategoryDto,
    @AccessToken() accessToken: string,
  ): Promise<void> {
    return await this.send<DeleteCategoryPayload, void>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.DELETE,
      {
        accessToken,
        categoryId,
        ...dto,
      },
    );
  }

  @Get("findAll")
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CategoryInfoResponse[]> {
    return await this.send<any, CategoryInfoResponse[]>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.FIND_ALL,
      {},
    );
  }

  @Get(":categoryId")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param("categoryId") categoryId: string,
  ): Promise<CategoryInfoResponse> {
    return await this.send<FindOneCategoryPayload, CategoryInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.FIND_ONE,
      {
        categoryId,
      },
    );
  }
}
