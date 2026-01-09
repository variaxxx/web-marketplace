import { AllowedRoles, ApiFormattedFindManyResponse, ApiFormattedResponse, UserInfo } from "../../shared";
import { CreateSellerApplicationRequest, FindManySellerApplicationsQuery, RejectSellerApplicationRequest, SellerApplicationInfoResponse } from "./dto";
import { SellerApplicationClientGrpc } from "./seller-application.grpc";
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { FindManyApiResponse } from "@web-marketplace/api";
import { AuthTokenPayload, SELLER_APPLICATION_STATUS, sellerApplicationStatusMappings, SORT_ORDER, sortOrderMappings, timestampToDate, USER_ROLE } from "@web-marketplace/backend";
import { SellerApplicationInfoResponse as GrpcSellerApplicationInfo } from "@web-marketplace/contracts/gen/seller-application";

@Controller("seller-applications")
export class SellerApplicationController {
  private toResponseDto(
    app: GrpcSellerApplicationInfo,
  ): SellerApplicationInfoResponse {
    return {
      ...app,
      createdAt: timestampToDate(app.createdAt),
      status: sellerApplicationStatusMappings.fromGrpc(app.status),
      decisionMadeAt: app.decisionMadeAt ? timestampToDate(app.decisionMadeAt) : null,
      reviewedBy: app.reviewedBy
        ? {
            ...app.reviewedBy,
            name: app.reviewedBy.name ?? null,
            avatarUrl: app.reviewedBy.avatarUrl ?? null,
          }
        : undefined,
      storeDescription: app.storeDescription ?? null,
    };
  }

  constructor(
    private readonly client: SellerApplicationClientGrpc,
  ) {}

  @ApiOperation({
    summary: "Creation of seller application",
  })
  @ApiFormattedResponse(
    HttpStatus.CREATED,
    SellerApplicationInfoResponse,
  )
  @AllowedRoles(USER_ROLE.USER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: CreateSellerApplicationRequest,
  ): Promise<SellerApplicationInfoResponse> {
    const res = await this.client.call("create", {
      userInfo,
      ...dto,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({
    summary: "Cancellation of seller application",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    SellerApplicationInfoResponse,
  )
  @AllowedRoles(USER_ROLE.USER)
  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param("id") id: string,
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const res = await this.client.call("cancel", {
      userInfo,
      applicationId: id,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({
    summary: "Rejection of seller application",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    SellerApplicationInfoResponse,
  )
  @AllowedRoles(USER_ROLE.ADMIN)
  @Post(":id/reject")
  @HttpCode(HttpStatus.OK)
  async decline(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
    @Body() dto: RejectSellerApplicationRequest,
  ): Promise<SellerApplicationInfoResponse> {
    const res = await this.client.call("reject", {
      userInfo,
      applicationId: id,
      ...dto,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({
    summary: "Approval of seller application",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    SellerApplicationInfoResponse,
  )
  @AllowedRoles(USER_ROLE.ADMIN)
  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param("id") id: string,
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const res = await this.client.call("approve", {
      userInfo,
      applicationId: id,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({
    summary: "Receiving multiple seller application",
  })
  @ApiFormattedFindManyResponse(
    HttpStatus.OK,
    SellerApplicationInfoResponse,
    "FindManySellerApplicationsResponse",
  )
  @ApiQuery({
    name: "status",
    enum: SELLER_APPLICATION_STATUS,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: "offset",
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: "sortOrder",
    enum: SORT_ORDER,
    required: false,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findMany(
    @UserInfo() userInfo: AuthTokenPayload,
    @Query() query: FindManySellerApplicationsQuery,
  ): Promise<FindManyApiResponse<SellerApplicationInfoResponse>> {
    const res = await this.client.call("findMany", {
      userInfo,
      status: query.status ? sellerApplicationStatusMappings.toGrpc(query.status) : undefined,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortOrder
        ? {
            field: "createdAt",
            order: sortOrderMappings.toGrpc(query.sortOrder),
          }
        : undefined,
    });

    return {
      ...res,
      items: res.items ? res.items.map(i => this.toResponseDto(i)) : [],
    };
  }

  @ApiOperation({
    summary: "Getting a seller application by ID",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    SellerApplicationInfoResponse,
  )
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("id") id: string,
  ): Promise<SellerApplicationInfoResponse> {
    const res = await this.client.call("findOne", {
      userInfo,
      applicationId: id,
    });

    return this.toResponseDto(res);
  }
}
