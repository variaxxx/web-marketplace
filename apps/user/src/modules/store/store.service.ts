import { PrismaService } from "../../infra/db/prisma.service";
import { STORE_FIELDS_CONFIG, StoreUpdates } from "../../shared";
import { STORE_SELECT } from "./store.constants";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/generated/userClient";
import { GRPC_ERROR_CODE, MicroserviceError, MS_IN_MIN, normalizeText, PrismaQueryError, STORE_EDIT_REQUEST_STATUS } from "@web-marketplace/backend";
import { EditStoreInfoPayload, GetStoreInfoPayload, StoreInfoResponse, ValueChange } from "@web-marketplace/contracts/gen/store";

@Injectable()
export class StoreService {
  private toResponse(
    store: Prisma.StoreGetPayload<{ select: typeof STORE_SELECT }>,
  ): StoreInfoResponse {
    return {
      ...store,
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
      select: STORE_SELECT,
    });

    if (!store)
      throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Store not found");

    return this.toResponse(store);
  }

  async editInfo(
    payload: EditStoreInfoPayload,
  ): Promise<void> {
    if (!payload.changes || !payload.changes.length)
      throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "No changes were provided");

    await this.prisma.$transaction(async (tx) => {
      const oldStore = await tx.store.findUnique({
        where: { ownerId: payload.userInfo.userId },
        select: { id: true, name: true, description: true, avatarUrl: true },
      });

      if (!oldStore)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Store not found");

      const lastRequest = await tx.storeEditRequest.findFirst({
        where: {
          store: { ownerId: payload.userInfo.userId },
          status: STORE_EDIT_REQUEST_STATUS.PENDING,
        },
        select: { createdAt: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      });

      if (lastRequest && lastRequest.createdAt > new Date(Date.now() - MS_IN_MIN * 0.1))
        throw new MicroserviceError(GRPC_ERROR_CODE.RESOURCE_EXHAUSTED, "Too many edit requests, try again later.");

      const fieldChanges = this.processChanges(payload.changes, oldStore);

      await tx.storeEditRequest.updateMany({
        where: { storeId: oldStore.id, status: STORE_EDIT_REQUEST_STATUS.PENDING },
        data: { status: STORE_EDIT_REQUEST_STATUS.REJECTED },
      });

      await tx.storeEditRequest.create({
        data: {
          storeId: oldStore.id,
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
    });
  }

  public async editInfoImmediate(
    payload: EditStoreInfoPayload,
  ): Promise<StoreInfoResponse> {
    const changes = this.processImmediateChanges(payload.changes);

    return await this.prisma.store.update({
      where: { id: payload.storeId },
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

      if (change.type.toString() === "CLEAR") {
        if (config.required)
          throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, `${fieldName} is required`);

        result.push({
          fieldName,
          action: "CLEAR",
        });
      } else if (change.type.toString() === "SET") {
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
      } else {
        throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Invalid value change action");
      }

      processedFields.add(fieldName);
    }

    return result;
  }
}
