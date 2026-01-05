// import { UserInfo } from "../../common/decorators/user-info.decorator";
// import { BaseController } from "../base.controller";
// import { HttpService } from "@nestjs/axios";
// import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { ClientProxy } from "@nestjs/microservices";
// import { AddWishlistItemDto, AddWishlistItemPayload, AuthTokenPayload, FindManyApiResponse, FindManyWishlistItemsPayload, FindProductsByIdsPayload, MicroserviceName, PRODUCT_PATTERNS, ProductInfoResponse, RemoveWishlistItemPayload, USER_PATTERNS } from "@web-marketplace/shared";

// @Controller("wishlist")
// export class WishlistController extends BaseController {
//   constructor(
//     protected readonly config: ConfigService,
//     protected readonly http: HttpService,
//     @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
//     @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
//   ) {
//     super(config, http);
//   }

//   // @Post()
//   // @HttpCode(HttpStatus.NO_CONTENT)
//   // async addItem(
//   //   @Body() dto: AddWishlistItemDto,
//   //   @UserInfo() userInfo: AuthTokenPayload,
//   // ): Promise<void> {
//   //   return void await this.send<AddWishlistItemPayload, boolean>(
//   //     this.userClient,
//   //     USER_PATTERNS.WISHLIST.ADD_ITEM,
//   //     {
//   //       userInfo,
//   //       ...dto,
//   //     },
//   //   );
//   // }

//   // @Get()
//   // @HttpCode(HttpStatus.OK)
//   // async findItems(
//   //   @UserInfo() userInfo: AuthTokenPayload,
//   //   @Query("offset") offset?: number,
//   //   @Query("limit") limit?: number,
//   // ): Promise<FindManyApiResponse<ProductInfoResponse>> {
//   //   const itemsIds = await this.send<FindManyWishlistItemsPayload, FindManyApiResponse<string>>(
//   //     this.userClient,
//   //     USER_PATTERNS.WISHLIST.FIND_MANY_ITEMS,
//   //     {
//   //       userInfo,
//   //       limit,
//   //       offset,
//   //     },
//   //   );

//   //   const items = await this.send<FindProductsByIdsPayload, ProductInfoResponse[]>(
//   //     this.productClient,
//   //     PRODUCT_PATTERNS.PRODUCT.FIND_BY_IDS,
//   //     { ids: itemsIds.items },
//   //   );

//   //   return {
//   //     count: itemsIds.count,
//   //     total: itemsIds.total,
//   //     items,
//   //   };
//   // }

//   // @Delete(":productId")
//   // @HttpCode(HttpStatus.NO_CONTENT)
//   // async deleteItem(
//   //   @Param("productId") productId: string,
//   //   @UserInfo() userInfo: AuthTokenPayload,
//   // ): Promise<void> {
//   //   return void await this.send<RemoveWishlistItemPayload, boolean>(
//   //     this.userClient,
//   //     USER_PATTERNS.WISHLIST.REMOVE_ITEM,
//   //     {
//   //       userInfo,
//   //       productId,
//   //     },
//   //   );
//   // }
// }
