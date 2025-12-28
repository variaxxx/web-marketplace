import { SellerApplicationService } from "./seller-application.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ApproveSellerApplicationPayload, CancelSellerApplicationPayload, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, SellerApplicationInfoResponse, USER_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class SellerApplicationController {
  constructor(
    private readonly sellerApplicationService: SellerApplicationService,
  ) {}

  @MessagePattern(USER_PATTERNS.SELLER_APPLICATION.CREATE)
  async create(
    @Payload() payload: CreateSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.sellerApplicationService.create(payload);
  }

  @MessagePattern(USER_PATTERNS.SELLER_APPLICATION.APPROVE)
  async approve(
    @Payload() payload: ApproveSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.sellerApplicationService.approve(payload);
  }

  @MessagePattern(USER_PATTERNS.SELLER_APPLICATION.DECLINE)
  async decline(
    @Payload() payload: DeclineSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.sellerApplicationService.decline(payload);
  }

  @MessagePattern(USER_PATTERNS.SELLER_APPLICATION.CANCEL)
  async cancel(
    @Payload() payload: CancelSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.sellerApplicationService.cancel(payload);
  }

  @MessagePattern(USER_PATTERNS.SELLER_APPLICATION.FIND_ONE)
  async findOne(
    @Payload() payload: FindOneSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.sellerApplicationService.findOne(payload);
  }

  @MessagePattern(USER_PATTERNS.SELLER_APPLICATION.FIND_MANY)
  async findMany(
    @Payload() payload: FindManySellerApplicationsPayload,
  ): Promise<FindManyApiResponse<SellerApplicationInfoResponse>> {
    return await this.sellerApplicationService.findMany(payload);
  }
}
