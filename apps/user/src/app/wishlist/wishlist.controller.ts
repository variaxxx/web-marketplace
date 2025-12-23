import { WishlistService } from "./wishlist.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AddWishlistItemPayload, AuthTokenPayload, FindManyApiResponse, FindManyWishlistItemsPayload, IsPublic, JwtPayload, ProductStatusChangedPayload, RemoveWishlistItemPayload, RpcAllowedRoles, USER_PATTERNS, UserRole } from "@web-marketplace/shared";

@Controller()
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
  ) {}

  @RpcAllowedRoles(UserRole.USER, UserRole.SELLER, UserRole.ADMIN)
  @MessagePattern(USER_PATTERNS.WISHLIST.ADD_ITEM)
  async addItem(
    @Payload() payload: AddWishlistItemPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<boolean> {
    await this.wishlistService.addItem(payload, jwtPayload);
    return true;
  }

  @RpcAllowedRoles(UserRole.USER, UserRole.SELLER, UserRole.ADMIN)
  @MessagePattern(USER_PATTERNS.WISHLIST.FIND_MANY_ITEMS)
  async findItems(
    @Payload() payload: FindManyWishlistItemsPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<FindManyApiResponse<string>> {
    return await this.wishlistService.findItems(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.USER, UserRole.SELLER, UserRole.ADMIN)
  @MessagePattern(USER_PATTERNS.WISHLIST.REMOVE_ITEM)
  async removeItem(
    @Payload() payload: RemoveWishlistItemPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<boolean> {
    await this.wishlistService.removeItem(payload, jwtPayload);
    return true;
  }

  @IsPublic()
  @EventPattern(USER_PATTERNS.WISHLIST.PRODUCT_STATUS_CHANGED)
  async productStatusChanged(
    @Payload() payload: ProductStatusChangedPayload,
  ): Promise<void> {
    return void await this.wishlistService.productStatusChanged(payload);
  }
}
