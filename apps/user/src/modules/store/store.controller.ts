import { StoreService } from "./store.service";
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { EditStoreInfoPayload, GetStoreInfoPayload, StoreInfoResponse } from "@web-marketplace/contracts/gen/store";

// TODO: find many stores
@Controller()
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_SERVICE, "GetInfo")
  async getInfo(
    payload: GetStoreInfoPayload,
  ): Promise<StoreInfoResponse> {
    return await this.storeService.getInfo(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_SERVICE, "EditInfo")
  async editInfo(
    payload: EditStoreInfoPayload,
  ): Promise<void> {
    return await this.storeService.editInfo(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_SERVICE, "EditInfoImmediate")
  async editInfoImmediate(
    payload: EditStoreInfoPayload,
  ): Promise<StoreInfoResponse> {
    return this.storeService.editInfoImmediate(payload);
  }
}
