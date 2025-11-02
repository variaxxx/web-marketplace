import { StoreService } from "./store.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthTokenPayload, GetMyStorePayload, GetStoreInfoPayload, IsPublic, JwtPayload, RpcAllowedRoles, SetStorePicturePayload, StoreInfoResponse, USER_PATTERNS, UserRole } from "@web-marketplace/shared";

@Controller()
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
  ) {}

  @IsPublic()
  @MessagePattern(USER_PATTERNS.GET_STORE_INFO)
  async getInfo(
    @Payload() payload: GetStoreInfoPayload,
  ): Promise<StoreInfoResponse> {
    return await this.storeService.getInfo(payload);
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(USER_PATTERNS.GET_MY_STORE)
  async getMyStore(
    @Payload() payload: GetMyStorePayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<StoreInfoResponse> {
    return await this.storeService.getInfo({
      ownerId: jwtPayload.userId,
    });
  }

  @RpcAllowedRoles(UserRole.SELLER)
  @MessagePattern(USER_PATTERNS.SET_STORE_PICTURE)
  async setStorePicture(
    @Payload() payload: SetStorePicturePayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<StoreInfoResponse> {
    return await this.storeService.setStorePicture(payload, jwtPayload);
  }
}
