// import { AllowedRoles } from "../../common/decorators/allowed-roles.decorator";
// import { IsPublic } from "../../common/decorators/is-public.decorator";
// import { UserInfo } from "../../common/decorators/user-info.decorator";
// import { BaseController } from "../base.controller";
// import { HttpService } from "@nestjs/axios";
// import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { ClientProxy } from "@nestjs/microservices";
// import { AuthTokenPayload, CategoryInfoResponse, CreateCategoryDto, CreateCategoryPayload, DeleteCategoryDto, DeleteCategoryPayload, EditCategoryDto, EditCategoryPayload, FindOneCategoryPayload, MicroserviceName, USER_ROLE } from "@web-marketplace/shared";

// @Controller("category")
// export class CategoryController extends BaseController {
//   constructor(
//     protected readonly config: ConfigService,
//     protected readonly http: HttpService,
//     @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
//   ) {
//     super(config, http);
//   }

//   @AllowedRoles(USER_ROLE.ADMIN)
//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   async create(
//     @Body() dto: CreateCategoryDto,
//     @UserInfo() userInfo: AuthTokenPayload,
//   ): Promise<CategoryInfoResponse> {
//     return await this.send<CreateCategoryPayload, CategoryInfoResponse>(
//       MicroserviceName.PRODUCT_SERVICE,
//       "category",
//       "post",
//       {
//         userInfo,
//         ...dto,
//       },
//     );
//   }

//   @AllowedRoles(USER_ROLE.ADMIN)
//   @Patch(":categoryId")
//   @HttpCode(HttpStatus.OK)
//   async edit(
//     @Body() dto: EditCategoryDto,
//     @Param("categoryId") categoryId: string,
//     @UserInfo() userInfo: AuthTokenPayload,
//   ): Promise<CategoryInfoResponse> {
//     return await this.send<EditCategoryPayload, CategoryInfoResponse>(
//       MicroserviceName.PRODUCT_SERVICE,
//       "category",
//       "patch",
//       {
//         userInfo,
//         categoryId,
//         ...dto,
//       },
//     );
//   }

//   @AllowedRoles(USER_ROLE.ADMIN)
//   @Delete(":categoryId")
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async delete(
//     @Param("categoryId") categoryId: string,
//     @Body() dto: DeleteCategoryDto,
//     @UserInfo() userInfo: AuthTokenPayload,
//   ): Promise<void> {
//     return await this.send<DeleteCategoryPayload, void>(
//       MicroserviceName.PRODUCT_SERVICE,
//       "category",
//       "delete",
//       {
//         userInfo,
//         categoryId,
//         ...dto,
//       },
//     );
//   }

//   @IsPublic()
//   @Get("findAll")
//   @HttpCode(HttpStatus.OK)
//   async findAll(): Promise<CategoryInfoResponse[]> {
//     return await this.send<any, CategoryInfoResponse[]>(
//       MicroserviceName.PRODUCT_SERVICE,
//       "category/findAll",
//       "get",
//       {},
//     );
//   }

//   @IsPublic()
//   @Get(":categoryId")
//   @HttpCode(HttpStatus.OK)
//   async findOne(
//     @Param("categoryId") categoryId: string,
//   ): Promise<CategoryInfoResponse> {
//     return await this.send<FindOneCategoryPayload, CategoryInfoResponse>(
//       MicroserviceName.PRODUCT_SERVICE,
//       "category/findOne",
//       "get",
//       {
//         categoryId,
//       },
//     );
//   }
// }
