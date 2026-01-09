import { PrismaService } from "../../infra/db/prisma.service";
import { StoreUpdates } from "../../shared";
import { FIELD_CHANGES_SELECT } from "./store-moderation.constants";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/generated/userClient";
import { clamp, dateToTimestamp, GRPC_ERROR_CODE, MicroserviceError, normalizeText, PrismaQueryError, STORE_EDIT_REQUEST_STATUS, storeEditRequestStatusMappings, USER_ROLE } from "@web-marketplace/backend";
import { ApproveStoreEditPayload, GetStoreEditRequestPayload, GetStoreEditRequestsPayload, RejectStoreEditPayload, StoreEditRequestResponse, StoreEditRequestsResponse, ValueChange_OperationType } from "@web-marketplace/contracts/gen/store";

@Injectable()
export class StoreModerationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  public async approveEdit(
    payload: ApproveStoreEditPayload,
  ): Promise<StoreEditRequestResponse> {
    const editRequest = await this.prisma.$transaction(async (tx) => {
      const editRequest = await tx.storeEditRequest.update({
        where: {
          id: payload.requestId,
          status: STORE_EDIT_REQUEST_STATUS.PENDING,
        },
        data: {
          status: STORE_EDIT_REQUEST_STATUS.APPROVED,
          decisionMadeAt: new Date(),
          reviewedById: payload.userInfo.userId,
        },
        include: {
          storeEditFieldChanges: { select: FIELD_CHANGES_SELECT },
        },
      }).catch((e) => {
        if (e.code === PrismaQueryError.RecordsNotFound)
          throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "No pending edit request found");
        throw e;
      });

      const updates = this.extractUpdates(editRequest.storeEditFieldChanges);

      await tx.store.update({
        where: { id: editRequest.storeId },
        data: {
          name: updates.name,
          description: updates.description,
          avatarUrl: updates.avatarUrl,
        },
      });

      return editRequest;
    });

    return this.toResponse(editRequest);
  }

  public async rejectEdit(
    payload: RejectStoreEditPayload,
  ): Promise<StoreEditRequestResponse> {
    const editRequest = await this.prisma.storeEditRequest.update({
      where: {
        id: payload.requestId,
        status: STORE_EDIT_REQUEST_STATUS.PENDING,
      },
      data: {
        status: STORE_EDIT_REQUEST_STATUS.REJECTED,
        decisionMadeAt: new Date(),
        reviewedById: payload.userInfo.userId,
        rejectionReason: payload.rejectionReason
          ? normalizeText(payload.rejectionReason, "rejectionReason")
          : undefined,
      },
      include: {
        storeEditFieldChanges: { select: FIELD_CHANGES_SELECT },
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "No pending edit request found");
      throw e;
    });

    return this.toResponse(editRequest);
  }

  public async getEditRequest(
    payload: GetStoreEditRequestPayload,
  ): Promise<StoreEditRequestResponse> {
    const editRequest = await this.prisma.storeEditRequest.findUnique({
      where: { id: payload.requestId },
      include: {
        storeEditFieldChanges: { select: FIELD_CHANGES_SELECT },
      },
    });

    return this.toResponse(editRequest);
  }

  // TODO: order
  public async getManyEditRequests(
    payload: GetStoreEditRequestsPayload,
  ): Promise<StoreEditRequestsResponse> {
    const where: Prisma.StoreEditRequestWhereInput = {};

    if (payload.status) {
      where.status = storeEditRequestStatusMappings.fromGrpc(payload.status);
    }
    if (payload.ownerId) {
      where.store = {
        ownerId: payload.ownerId,
      };
    }
    if (payload.storeId)
      where.storeId = payload.storeId;
    if (payload.userInfo.role === USER_ROLE.SELLER) {
      where.store = {
        ownerId: payload.userInfo.userId,
      };
    }

    const [editRequests, totalCount] = await this.prisma.$transaction([
      this.prisma.storeEditRequest.findMany({
        where,
        take: payload.limit ? clamp(payload.limit, 0, 20) : undefined,
        skip: payload.offset ? Math.max(payload.offset, 0) : undefined,
        include: {
          storeEditFieldChanges: { select: FIELD_CHANGES_SELECT },
        },
      }),
      this.prisma.storeEditRequest.count({ where }),
    ]);

    return {
      total: totalCount,
      count: editRequests.length,
      items: editRequests.map(r => this.toResponse(r)),
    };
  }

  private toResponse(
    editRequest: any,
  ): StoreEditRequestResponse {
    return {
      id: editRequest.id,
      createdAt: dateToTimestamp(editRequest.createdAt),
      status: storeEditRequestStatusMappings.toGrpc(editRequest.status),
      storeId: editRequest.storeId,
      changes: editRequest.storeEditFieldChanges.map(i => ({
        fieldName: i.fieldName,
        type: i.action === "CLEAR" ? ValueChange_OperationType.CLEAR : ValueChange_OperationType.SET,
        oldValue: i.oldValue,
        newValue: i.newValue,
      })),
    };
  }

  private extractUpdates(
    updates: Prisma.StoreEditFieldChangeGetPayload<{ select: {
      action: true;
      fieldName: true;
      oldValue: true;
      newValue: true;
    }; }>[],
  ): StoreUpdates {
    const result: StoreUpdates = {};

    for (const update of updates) {
      const fieldName = update.fieldName;

      if (update.action === "CLEAR") {
        result[fieldName] = null;
      } else if (update.action === "SET") {
        result[fieldName] = update.newValue;
      }
    }

    return result;
  }
}
