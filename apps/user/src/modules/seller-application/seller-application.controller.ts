import { SellerApplicationService } from "./seller-application.service";
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { ApproveSellerApplicationPayload, CancelSellerApplicationPayload, CreateSellerApplicationPayload, FindManySellerApplicationsPayload, FindManySellerApplicationsResponse, FindOneSellerApplicationPayload, RejectSellerApplicationPayload, SellerApplicationInfoResponse } from "@web-marketplace/contracts/gen/seller-application";

@Controller()
export class SellerApplicationController {
  constructor(
    private readonly service: SellerApplicationService,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.SELLER_APPLICATION_SERVICE, "Create")
  async create(
    payload: CreateSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.service.create(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.SELLER_APPLICATION_SERVICE, "Approve")
  async approve(
    payload: ApproveSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.service.approve(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.SELLER_APPLICATION_SERVICE, "Reject")
  async decline(
    payload: RejectSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.service.reject(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.SELLER_APPLICATION_SERVICE, "Cancel")
  async cancel(
    payload: CancelSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.service.cancel(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.SELLER_APPLICATION_SERVICE, "FindOne")
  async findOne(
    payload: FindOneSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.service.findOne(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.SELLER_APPLICATION_SERVICE, "FindMany")
  async findMany(
    payload: FindManySellerApplicationsPayload,
  ): Promise<FindManySellerApplicationsResponse> {
    return await this.service.findMany(payload);
  }
}
