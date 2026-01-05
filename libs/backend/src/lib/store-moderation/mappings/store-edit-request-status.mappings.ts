import { STORE_EDIT_REQUEST_STATUS, StoreEditRequestStatus } from "../constants";
import { StoreEditRequestStatus as GrpcStatus } from "@web-marketplace/contracts/gen/store";

const STATUS_MAP = {
  [GrpcStatus.APPROVED]: STORE_EDIT_REQUEST_STATUS.APPROVED,
  [GrpcStatus.CANCELLED]: STORE_EDIT_REQUEST_STATUS.CANCELLED,
  [GrpcStatus.PENDING]: STORE_EDIT_REQUEST_STATUS.PENDING,
  [GrpcStatus.REJECTED]: STORE_EDIT_REQUEST_STATUS.REJECTED,
} as const;

type ValidGrpcStatus = Exclude<
  GrpcStatus,
  GrpcStatus.UNSPECIFIED | GrpcStatus.UNRECOGNIZED
>;

export const storeEditRequestStatusMappings = {
  fromGrpc: (status: GrpcStatus): StoreEditRequestStatus | null =>
    status in STATUS_MAP ? STATUS_MAP[status as ValidGrpcStatus] : null,

  toGrpc: (status: StoreEditRequestStatus): GrpcStatus =>
    GrpcStatus[status],
};
