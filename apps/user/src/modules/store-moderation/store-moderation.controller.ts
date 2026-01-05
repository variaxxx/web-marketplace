import { StoreModerationService } from "./store-moderation.service";
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { ApproveStoreEditPayload, CancelStoreEditPayload, RejectStoreEditPayload, StoreEditRequestResponse } from "@web-marketplace/contracts/gen/store";

@Controller()
export class StoreModerationController {
  constructor(
    private readonly service: StoreModerationService,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_MODERATION_SERVICE, "CancelEdit")
  async cancelEdit(
    payload: CancelStoreEditPayload,
  ): Promise<StoreEditRequestResponse> {
    return this.service.cancelEdit(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_MODERATION_SERVICE, "ApproveEdit")
  async approveEdit(
    payload: ApproveStoreEditPayload,
  ): Promise<StoreEditRequestResponse> {
    return this.service.approveEdit(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_MODERATION_SERVICE, "RejectEdit")
  async rejectEdit(
    payload: RejectStoreEditPayload,
  ): Promise<StoreEditRequestResponse> {
    return this.service.rejectEdit(payload);
  }
}
