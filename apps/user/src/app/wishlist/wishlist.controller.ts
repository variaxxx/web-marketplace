import { WishlistService } from "./wishlist.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AddWishlistItemPayload, FindManyApiResponse, FindManyWishlistItemsPayload, ProductStatusChangedPayload, RemoveWishlistItemPayload, USER_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
  ) {}

  @MessagePattern(USER_PATTERNS.WISHLIST.ADD_ITEM)
  async addItem(
    @Payload() payload: AddWishlistItemPayload,
  ): Promise<boolean> {
    await this.wishlistService.addItem(payload);
    return true;
  }

  @MessagePattern(USER_PATTERNS.WISHLIST.FIND_MANY_ITEMS)
  async findItems(
    @Payload() payload: FindManyWishlistItemsPayload,
  ): Promise<FindManyApiResponse<string>> {
    return await this.wishlistService.findItems(payload);
  }

  @MessagePattern(USER_PATTERNS.WISHLIST.REMOVE_ITEM)
  async removeItem(
    @Payload() payload: RemoveWishlistItemPayload,
  ): Promise<boolean> {
    await this.wishlistService.removeItem(payload);
    return true;
  }

  @EventPattern(USER_PATTERNS.WISHLIST.PRODUCT_STATUS_CHANGED)
  async productStatusChanged(
    @Payload() payload: ProductStatusChangedPayload,
  ): Promise<void> {
    return void await this.wishlistService.productStatusChanged(payload);
  }
}
