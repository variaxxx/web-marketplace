import { AllowedRoles, IsPublic, UserInfo } from "../../shared";
import { EditStoreInfoRequest, StoreEditRequestResponse, StoreInfoResponse } from "./dto";
import { StoreClientGrpc } from "./store.grpc";
import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { AuthTokenPayload, normalizeText, storeEditRequestStatusMappings, timestampToDate, USER_ROLE } from "@web-marketplace/backend";
import { ValueChange, ValueChange_OperationType } from "@web-marketplace/contracts/gen/store";

@Controller("stores")
export class StoreController {
  constructor(
    private readonly client: StoreClientGrpc,
  ) {}

  @Get("my")
  @AllowedRoles(USER_ROLE.SELLER)
  async getMy(
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<StoreInfoResponse> {
    const res = await this.client.call("getInfo", {
      ownerId: userInfo.userId,
    });

    return {
      id: res.id,
      name: res.name,
      description: res.description ?? null,
      avatarUrl: res.avatarUrl ?? null,
    };
  }

  @Patch("my")
  @AllowedRoles(USER_ROLE.SELLER)
  async editMy(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: EditStoreInfoRequest,
  ): Promise<StoreEditRequestResponse> {
    const changes: ValueChange[] = [];

    if (dto.name !== undefined) {
      changes.push({
        fieldName: "name",
        type: ValueChange_OperationType.SET,
        newValue: normalizeText(dto.name, "name"),
      });
    }

    if (dto.description !== undefined) {
      changes.push({
        fieldName: "description",
        type: dto.description ? ValueChange_OperationType.SET : ValueChange_OperationType.CLEAR,
        newValue: dto.description ? normalizeText(dto.description, "name") : undefined,
      });
    }

    const res = await this.client.call("editInfo", {
      userInfo,
      changes,
    });

    return {
      ...res,
      createdAt: timestampToDate(res.createdAt),
      decisionMadeAt: res.decisionMadeAt ? timestampToDate(res.decisionMadeAt) : undefined,
      status: storeEditRequestStatusMappings.fromGrpc(res.status),
      changes: res.changes.map(i => ({
        fieldName: i.fieldName,
        action: i.type === ValueChange_OperationType.CLEAR ? "CLEAR" : "SET",
        newValue: i.newValue,
        oldValue: i.oldValue,
      })),
      reviewedBy: res.reviewedBy
        ? {
            id: res.reviewedBy.id,
            name: res.reviewedBy.name ?? null,
            avatarUrl: res.reviewedBy.avatarUrl ?? null,
          }
        : undefined,
    };
  }

  @Get(":storeId")
  @IsPublic()
  async getById(
    @Param("storeId") storeId: string,
  ): Promise<StoreInfoResponse> {
    const res = await this.client.call("getInfo", {
      storeId,
    });

    return {
      id: res.id,
      name: res.name,
      description: res.description ?? null,
      avatarUrl: res.avatarUrl ?? null,
    };
  }

  @Patch(":storeId")
  @AllowedRoles(USER_ROLE.ADMIN)
  async editInfoImmediate(
    @Param() storeId: string,
    @Body() dto: EditStoreInfoRequest,
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<StoreInfoResponse> {
    const changes: ValueChange[] = [];

    if (dto.name !== undefined) {
      changes.push({
        fieldName: "name",
        type: ValueChange_OperationType.SET,
        newValue: normalizeText(dto.name, "name"),
      });
    }

    if (dto.description !== undefined) {
      changes.push({
        fieldName: "description",
        type: dto.description ? ValueChange_OperationType.SET : ValueChange_OperationType.CLEAR,
        newValue: dto.description ? normalizeText(dto.description, "name") : undefined,
      });
    }

    const res = await this.client.call("editInfoImmediate", {
      userInfo,
      changes,
      storeId,
    });

    return {
      ...res,
      avatarUrl: res.avatarUrl ?? null,
    };
  }
}
