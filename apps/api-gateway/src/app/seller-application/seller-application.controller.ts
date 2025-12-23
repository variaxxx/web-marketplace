import { AccessToken } from "../../common/decorators/access-token.decorator";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApproveSellerApplicationPayload, CancelSellerApplicationPayload, CreateSellerApplicationDto, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsDto, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, MicroserviceName, SellerApplicationInfoResponse, USER_PATTERNS } from "@web-marketplace/shared";

@Controller("sellerApplication")
export class SellerApplicationController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AccessToken() accessToken: string,
    @Body() dto: CreateSellerApplicationDto,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<CreateSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.CREATE,
      {
        accessToken,
        ...dto,
      },
    );
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancel(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<CancelSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.CANCEL,
      {
        accessToken,
        applicationId: id,
      },
    );
  }

  @Post(":id/decline")
  @HttpCode(HttpStatus.OK)
  async decline(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<DeclineSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.DECLINE,
      {
        accessToken,
        applicationId: id,
      },
    );
  }

  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  async approve(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<ApproveSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.APPROVE,
      {
        accessToken,
        applicationId: id,
      },
    );
  }

  @Get("findMany")
  @HttpCode(HttpStatus.OK)
  async findMany(
    @AccessToken() accessToken: string,
    @Body() dto: FindManySellerApplicationsDto,
  ): Promise<FindManyApiResponse<SellerApplicationInfoResponse>> {
    return await this.send<FindManySellerApplicationsPayload, FindManyApiResponse<SellerApplicationInfoResponse>>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.FIND_MANY,
      {
        accessToken,
        ...dto,
      },
    );
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    return await this.send<FindOneSellerApplicationPayload, SellerApplicationInfoResponse>(
      this.userClient,
      USER_PATTERNS.SELLER_APPLICATION.FIND_ONE,
      {
        accessToken,
        applicationId: id,
      },
    );
  }
}
