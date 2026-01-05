import { PrismaService } from "../../infra/db/prisma.service";
import { StoreUpdates } from "../../shared";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/generated/userClient";
import { dateToTimestamp, GRPC_ERROR_CODE, MicroserviceError, PrismaQueryError, STORE_EDIT_REQUEST_STATUS, storeEditRequestStatusMappings } from "@web-marketplace/backend";
import { ApproveStoreEditPayload, CancelStoreEditPayload, RejectStoreEditPayload, StoreEditRequestResponse, ValueChange_OperationType } from "@web-marketplace/contracts/gen/store";

@Injectable()
export class StoreModerationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  public async cancelEdit(
    payload: CancelStoreEditPayload,
  ): Promise<StoreEditRequestResponse> {
    const editRequest = await this.prisma.storeEditRequest.update({
      where: {
        id: payload.requestId,
        store: { ownerId: payload.userInfo.userId },
        status: STORE_EDIT_REQUEST_STATUS.PENDING,
      },
      data: { status: STORE_EDIT_REQUEST_STATUS.CANCELLED },
      include: {
        storeEditFieldChanges: {
          select: {
            action: true,
            fieldName: true,
            oldValue: true,
            newValue: true,
          },
        },
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "No pending edit request found");
      throw e;
    });

    return this.toResponse(editRequest);
  }

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
          storeEditFieldChanges: {
            select: {
              action: true,
              fieldName: true,
              oldValue: true,
              newValue: true,
            },
          },
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
      },
      include: {
        storeEditFieldChanges: {
          select: {
            action: true,
            fieldName: true,
            oldValue: true,
            newValue: true,
          },
        },
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "No pending edit request found");
      throw e;
    });

    return this.toResponse(editRequest);
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
