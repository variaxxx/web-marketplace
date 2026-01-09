import { StoreModerationService } from "./store-moderation.service";
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { ApproveStoreEditPayload, GetStoreEditRequestPayload, GetStoreEditRequestsPayload, RejectStoreEditPayload, StoreEditRequestResponse, StoreEditRequestsResponse } from "@web-marketplace/contracts/gen/store";

@Controller()
export class StoreModerationController {
  constructor(
    private readonly service: StoreModerationService,
  ) {}

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

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_MODERATION_SERVICE, "GetEditRequest")
  async getOneEditRequest(
    payload: GetStoreEditRequestPayload,
  ): Promise<StoreEditRequestResponse> {
    return this.service.getEditRequest(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.STORE_MODERATION_SERVICE, "GetEditRequests")
  async getManyEditRequests(
    payload: GetStoreEditRequestsPayload,
  ): Promise<StoreEditRequestsResponse> {
    return this.service.getManyEditRequests(payload);
  }
}
