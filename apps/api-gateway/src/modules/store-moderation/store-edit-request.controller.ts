import { AllowedRoles, ApiFormattedFindManyResponse, ApiFormattedResponse, UserInfo } from "../../shared";
import { StoreEditRequestResponse } from "../store/dto";
import { FindManyStoreEditRequestsQuery, RejectStoreEditRequest } from "./dto";
import { StoreModerationClientGrpc } from "./store-moderation.grpc";
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { FindManyApiResponse } from "@web-marketplace/api";
import { AuthTokenPayload, STORE_EDIT_REQUEST_STATUS, storeEditRequestStatusMappings, timestampToDate, USER_ROLE } from "@web-marketplace/backend";
import { StoreEditRequestResponse as GrpcStoreEditRequestResponse, ValueChange_OperationType } from "@web-marketplace/contracts/gen/store";

@Controller("store/edit-requests")
export class StoreEditRequestController {
  constructor(
    private readonly client: StoreModerationClientGrpc,
  ) {}

  @ApiOperation({
    summary: "Approval of store edit request",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    StoreEditRequestResponse,
  )
  @HttpCode(HttpStatus.OK)
  @AllowedRoles(USER_ROLE.ADMIN)
  @Post(":requestId/approve")
  async approveEdit(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("requestId") requestId: string,
  ): Promise<StoreEditRequestResponse> {
    const res = await this.client.call("approveEdit", {
      requestId,
      userInfo,
    });
    return this.toResponse(res);
  }

  @ApiOperation({
    summary: "Rejection of store edit request",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    StoreEditRequestResponse,
  )
  @HttpCode(HttpStatus.OK)
  @AllowedRoles(USER_ROLE.ADMIN)
  @Post(":requestId/reject")
  async rejectEdit(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("requestId") requestId: string,
    @Body() dto: RejectStoreEditRequest,
  ): Promise<StoreEditRequestResponse> {
    const res = await this.client.call("rejectEdit", {
      requestId,
      userInfo,
      rejectionReason: dto.rejectionReason,
    });
    return this.toResponse(res);
  }

  @ApiOperation({
    summary: "Receiving multiple store edit requests",
  })
  @ApiFormattedFindManyResponse(
    HttpStatus.OK,
    StoreEditRequestResponse,
    "FindManyStoreEditRequestsResponse",
  )
  @HttpCode(HttpStatus.OK)
  @AllowedRoles(USER_ROLE.ADMIN)
  @Get()
  @ApiQuery({
    name: "ownerId",
    type: String,
    required: false,
  })
  @ApiQuery({
    name: "storeId",
    type: String,
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
    name: "status",
    enum: STORE_EDIT_REQUEST_STATUS,
    required: false,
  })
  async findManyEditRequests(
    @UserInfo() userInfo: AuthTokenPayload,
    @Query() query: FindManyStoreEditRequestsQuery,
  ): Promise<FindManyApiResponse<StoreEditRequestResponse>> {
    const res = await this.client.call("getEditRequests", {
      userInfo,
      storeId: query.storeId,
      limit: query.limit,
      offset: query.offset,
      ownerId: query.ownerId,
      status: storeEditRequestStatusMappings.toGrpc(query.status),
    });

    return {
      total: res.total,
      count: res.count,
      items: res.items
        ? res.items.map(i => this.toResponse(i))
        : [],
    };
  }

  @ApiOperation({
    summary: "Receiving store edit request by ID",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    StoreEditRequestResponse,
  )
  @HttpCode(HttpStatus.OK)
  @AllowedRoles(USER_ROLE.ADMIN)
  @Get(":requestId")
  async findOneEditRequest(
    @UserInfo() userInfo: AuthTokenPayload,
    @Param("requestId") requestId: string,
  ): Promise<StoreEditRequestResponse> {
    const res = await this.client.call("getEditRequest", {
      userInfo,
      requestId,
    });
    return this.toResponse(res);
  }

  private toResponse(
    request: GrpcStoreEditRequestResponse,
  ): StoreEditRequestResponse {
    return {
      id: request.id,
      storeId: request.storeId,
      createdAt: timestampToDate(request.createdAt),
      decisionMadeAt: request.decisionMadeAt ? timestampToDate(request.decisionMadeAt) : undefined,
      status: storeEditRequestStatusMappings.fromGrpc(request.status),
      changes: request.changes
        ? request.changes.map(i => ({
            fieldName: i.fieldName,
            action: i.type === ValueChange_OperationType.CLEAR ? "CLEAR" : "SET",
            newValue: i.newValue,
            oldValue: i.oldValue,
          }))
        : undefined,
      reviewedBy: request.reviewedBy
        ? {
            id: request.reviewedBy.id,
            name: request.reviewedBy.name ?? null,
            avatarUrl: request.reviewedBy.avatarUrl ?? null,
          }
        : undefined,
      rejectionReason: request.rejectionReason,
    };
  }
}
