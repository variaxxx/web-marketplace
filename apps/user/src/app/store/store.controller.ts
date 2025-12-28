import { StoreService } from "./store.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { FindMyStorePayload, FindOneStorePayload, SetStorePicturePayload, StoreInfoResponse, USER_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
  ) {}

  @MessagePattern(USER_PATTERNS.STORE.GET_INFO)
  async getInfo(
    @Payload() payload: FindOneStorePayload,
  ): Promise<StoreInfoResponse> {
    return await this.storeService.getInfo(payload);
  }

  @MessagePattern(USER_PATTERNS.STORE.GET_MY)
  async getMyStore(
    @Payload() payload: FindMyStorePayload,
  ): Promise<StoreInfoResponse> {
    return await this.storeService.getInfo({
      ownerId: payload.userInfo.userId,
    });
  }

  @MessagePattern(USER_PATTERNS.STORE.SET_STORE_PICTURE)
  async setStorePicture(
    @Payload() payload: SetStorePicturePayload,
  ): Promise<StoreInfoResponse> {
    return await this.storeService.setStorePicture(payload);
  }
}
