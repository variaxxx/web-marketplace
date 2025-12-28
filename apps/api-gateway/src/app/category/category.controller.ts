import { AllowedRoles } from "../../common/decorators/allowed-roles.decorator";
import { IsPublic } from "../../common/decorators/is-public.decorator";
import { UserInfo } from "../../common/decorators/user-info.decorator";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { AuthTokenPayload, CategoryInfoResponse, CreateCategoryDto, CreateCategoryPayload, DeleteCategoryDto, DeleteCategoryPayload, EditCategoryDto, EditCategoryPayload, FindOneCategoryPayload, MicroserviceName, PRODUCT_PATTERNS, USER_ROLE } from "@web-marketplace/shared";

@Controller("category")
export class CategoryController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {
    super();
  }

  @AllowedRoles(USER_ROLE.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCategoryDto,
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.send<CreateCategoryPayload, CategoryInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.CREATE,
      {
        userInfo,
        ...dto,
      },
    );
  }

  @AllowedRoles(USER_ROLE.ADMIN)
  @Patch(":categoryId")
  @HttpCode(HttpStatus.OK)
  async edit(
    @Body() dto: EditCategoryDto,
    @Param("categoryId") categoryId: string,
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<CategoryInfoResponse> {
    return await this.send<EditCategoryPayload, CategoryInfoResponse>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.EDIT,
      {
        userInfo,
        categoryId,
        ...dto,
      },
    );
  }

  @AllowedRoles(USER_ROLE.ADMIN)
  @Delete(":categoryId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("categoryId") categoryId: string,
    @Body() dto: DeleteCategoryDto,
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<void> {
    return await this.send<DeleteCategoryPayload, void>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.DELETE,
      {
        userInfo,
        categoryId,
        ...dto,
      },
    );
  }

  @IsPublic()
  @Get("findAll")
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CategoryInfoResponse[]> {
    return await this.send<any, CategoryInfoResponse[]>(
      this.productClient,
      PRODUCT_PATTERNS.CATEGORY.FIND_ALL,
      {},
    );
  }

  @IsPublic()
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
