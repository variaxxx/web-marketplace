import { PrismaService } from "../../infra/db/prisma.service";
import { STORE_FIELDS_CONFIG, StoreUpdates } from "../../shared";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/generated/userClient";
import { dateToTimestamp, GRPC_ERROR_CODE, MicroserviceError, normalizeText, PrismaQueryError, STORE_EDIT_REQUEST_STATUS, storeEditRequestStatusMappings } from "@web-marketplace/backend";
import { EditStoreInfoPayload, GetStoreInfoPayload, StoreEditRequestResponse, StoreInfoResponse, ValueChange, ValueChange_OperationType } from "@web-marketplace/contracts/gen/store";

const storeSelect = {
  ownerId: true,
  name: true,
  description: true,
  avatarUrl: true,
};

// TODO: made optional desc
// TODO: set pfp
@Injectable()
export class StoreService {
  private toResponse(
    store: Prisma.StoreGetPayload<{ select: typeof storeSelect }>,
  ): StoreInfoResponse {
    return {
      ...store,
      id: store.ownerId,
    };
  }

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getInfo(
    payload: GetStoreInfoPayload,
  ): Promise<StoreInfoResponse> {
    if (!payload.storeId && !payload.ownerId)
      throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "None of the IDs were provided");

    const where: Prisma.StoreWhereUniqueInput = payload.storeId
      ? { id: payload.storeId }
      : { ownerId: payload.ownerId };

    const store = await this.prisma.store.findUnique({
      where,
      select: storeSelect,
    });

    if (!store)
      throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Store not found");

    return this.toResponse(store);
  }

  async editInfo(
    payload: EditStoreInfoPayload,
  ): Promise<StoreEditRequestResponse> {
    const editRequest = await this.prisma.$transaction(async (tx) => {
      const oldStore = await tx.store.findUnique({
        where: { ownerId: payload.userInfo.userId },
        select: { name: true, description: true, avatarUrl: true },
      });

      if (!oldStore)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Store not found");

      const oldRequest = await tx.storeEditRequest.findFirst({
        where: {
          storeId: payload.userInfo.userId,
          status: STORE_EDIT_REQUEST_STATUS.PENDING,
        },
      });

      if (oldRequest)
        throw new MicroserviceError(GRPC_ERROR_CODE.PERMISSION_DENIED, "You already have a pending edit request");

      const fieldChanges = this.processChanges(payload.changes, oldStore);

      const editRequest = await tx.storeEditRequest.create({
        data: {
          storeId: payload.userInfo.userId,
          status: STORE_EDIT_REQUEST_STATUS.PENDING,
          storeEditFieldChanges: { createMany: { data: fieldChanges } },
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
      });

      return editRequest;
    });

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

  public async editInfoImmediate(
    payload: EditStoreInfoPayload,
  ): Promise<StoreInfoResponse> {
    const changes = this.processImmediateChanges(payload.changes);

    return await this.prisma.store.update({
      where: { ownerId: payload.storeId },
      data: {
        name: changes.name,
        description: changes.description,
        avatarUrl: changes.avatarUrl,
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatarUrl: true,
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Store not found");
      throw e;
    });
  }

  private processImmediateChanges(
    changes: ValueChange[],
  ): StoreUpdates {
    const changedFields = this.processChanges(changes);
    const result: StoreUpdates = {};

    for (const field of changedFields) {
      result[field.fieldName] = field.action === "CLEAR" ? null : field.newValue;
    }

    return result;
  };

  private processChanges(
    changes: ValueChange[],
    store?: { name: string; description: string; avatarUrl: string },
  ): Prisma.StoreEditFieldChangeCreateManyEditRequestInput[] {
    const allowedFields = Object.keys(STORE_FIELDS_CONFIG);
    const processedFields = new Set<string>();
    const result: Prisma.StoreEditFieldChangeCreateManyEditRequestInput[] = [];

    for (const change of changes) {
      const fieldName = change.fieldName;

      if (!allowedFields.includes(fieldName))
        throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Invalid field");

      if (processedFields.has(fieldName))
        throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Duplicate field");

      const config = STORE_FIELDS_CONFIG[fieldName];

      if (change.type === ValueChange_OperationType.CLEAR) {
        if (config.required)
          throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, `${fieldName} is required`);

        result.push({
          fieldName,
          action: "CLEAR",
        });
      } else if (change.type === ValueChange_OperationType.SET) {
        const newValue = normalizeText(change.newValue, fieldName);

        if (newValue.length > config.maxLength)
          throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, `${fieldName} exceeds permitted length`);

        if (store && newValue === store.name)
          throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, `The field is no different from the old one: ${fieldName}`);

        result.push({
          fieldName,
          action: "SET",
          newValue,
          oldValue: store ? store[fieldName] : undefined,
        });
      }

      processedFields.add(fieldName);
    }

    return result;
  }
}
