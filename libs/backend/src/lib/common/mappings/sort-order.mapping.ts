import { SORT_ORDER, SortOrder } from "../enums/sort-order.enum";
import { Order as GrpcOrder } from "@web-marketplace/contracts/gen/common";

function normalizeGrpcOrder(order: GrpcOrder | string | number): GrpcOrder {
  if (typeof order === "number") {
    return order;
  }

  if (typeof order === "string") {
    const numValue = GrpcOrder[order as keyof typeof GrpcOrder];
    if (numValue !== undefined && typeof numValue === "number") {
      return numValue;
    }
  }

  return GrpcOrder.UNSPECIFIED;
}

export const sortOrderMappings = {
  fromGrpc: (order: GrpcOrder | string): SortOrder | null => {
    const normalized = normalizeGrpcOrder(order);

    switch (normalized) {
      case GrpcOrder.ASC:
        return SORT_ORDER.ASC;
      case GrpcOrder.DESC:
        return SORT_ORDER.DESC;
      case GrpcOrder.UNSPECIFIED:
      case GrpcOrder.UNRECOGNIZED:
      default:
        return null;
    }
  },

  toGrpc: (order: SortOrder): GrpcOrder => {
    switch (order) {
      case SORT_ORDER.ASC:
        return GrpcOrder.ASC;
      case SORT_ORDER.DESC:
        return GrpcOrder.DESC;
      default:
        return GrpcOrder.UNSPECIFIED;
    }
  },
};
