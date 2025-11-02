import { SellerApplicationService } from "./seller-application.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ApproveSellerApplicationPayload, AuthTokenPayload, CancelSellerApplicationPayload, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, JwtPayload, RpcAllowedRoles, SellerApplicationResponse, USER_PATTERNS, UserRole } from "@web-marketplace/shared";

@Controller()
export class SellerApplicationController {
  constructor(
    private readonly sellerApplicationService: SellerApplicationService,
  ) {}

  @RpcAllowedRoles(UserRole.USER, UserRole.SELLER)
  @MessagePattern(USER_PATTERNS.CREATE_SELLER_APPLICATION)
  async create(
    @Payload() payload: CreateSellerApplicationPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<SellerApplicationResponse> {
    return await this.sellerApplicationService.create(payload, jwtPayload);
  }

  @RpcAllowedRoles(UserRole.ADMIN)
  @MessagePattern(USER_PATTERNS.APPROVE_SELLER_APPLICATION)
  async approve(
    @Payload() payload: ApproveSellerApplicationPayload,
  ): Promise<SellerApplicationResponse> {
    return await this.sellerApplicationService.approve(payload);
  }

  @RpcAllowedRoles(UserRole.ADMIN)
  @MessagePattern(USER_PATTERNS.DECLINE_SELLER_APPLICATION)
  async decline(
    @Payload() payload: DeclineSellerApplicationPayload,
  ): Promise<SellerApplicationResponse> {
    return await this.sellerApplicationService.decline(payload);
  }

  @RpcAllowedRoles(UserRole.USER)
  @MessagePattern(USER_PATTERNS.CANCEL_SELLER_APPLICATION)
  async cancel(
    @Payload() payload: CancelSellerApplicationPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<SellerApplicationResponse> {
    return await this.sellerApplicationService.cancel(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.FIND_ONE_SELLER_APPLICATION)
  async findOne(
    @Payload() payload: FindOneSellerApplicationPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<SellerApplicationResponse> {
    return await this.sellerApplicationService.findOne(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.FIND_MANY_SELLER_APPLICATION)
  async findMany(
    @Payload() payload: FindManySellerApplicationsPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<FindManyApiResponse<SellerApplicationResponse>> {
    return await this.sellerApplicationService.findMany(payload, jwtPayload);
  }
}
