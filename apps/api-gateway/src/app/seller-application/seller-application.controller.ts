import { AllowedRoles } from "../../common/decorators/allowed-roles.decorator";
import { UserInfo } from "../../common/decorators/user-info.decorator";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApproveSellerApplicationPayload, AuthTokenPayload, CancelSellerApplicationPayload, CreateSellerApplicationDto, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsDto, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, MicroserviceName, SellerApplicationInfoResponse, USER_PATTERNS, USER_ROLE } from "@web-marketplace/shared";

@Controller("sellerApplication")
export class SellerApplicationController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {
    super();
  }

  @AllowedRoles(USER_ROLE.USER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: CreateSellerApplicationDto,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<CreateSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.CREATE,
      {
        userInfo,
        ...dto,
      },
    );
  }

  @AllowedRoles(USER_ROLE.USER)
  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param("id") id: string,
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<CancelSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.CANCEL,
      {
        userInfo,
        applicationId: id,
      },
    );
  }

  @AllowedRoles(USER_ROLE.ADMIN)
  @Post(":id/decline")
  @HttpCode(HttpStatus.OK)
  async decline(
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<DeclineSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.DECLINE,
      {
        applicationId: id,
      },
    );
  }

  @AllowedRoles(USER_ROLE.ADMIN)
  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<ApproveSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.APPROVE,
      {
        applicationId: id,
      },
    );
  }

  @Get("findMany")
  @HttpCode(HttpStatus.OK)
  async findMany(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: FindManySellerApplicationsDto,
  ): Promise<FindManyApiResponse<SellerApplicationInfoResponse>> {
    return await this.send<FindManySellerApplicationsPayload, FindManyApiResponse<SellerApplicationInfoResponse>>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.FIND_MANY,
      {
        userInfo,
        ...dto,
      },
    );
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<FindOneSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.FIND_ONE,
      {
        userInfo,
        applicationId: id,
      },
    );
  }
}
