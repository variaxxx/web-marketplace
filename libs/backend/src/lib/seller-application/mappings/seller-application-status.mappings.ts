import { SELLER_APPLICATION_STATUS, SellerApplicationStatus } from "../enums/seller-application-status.enum";
import { SellerApplicationStatus as GrpcStatus } from "@web-marketplace/contracts/gen/seller-application";

const STATUS_MAP = {
  [GrpcStatus.APPROVED]: SELLER_APPLICATION_STATUS.APPROVED,
  [GrpcStatus.CANCELLED]: SELLER_APPLICATION_STATUS.CANCELLED,
  [GrpcStatus.PENDING]: SELLER_APPLICATION_STATUS.PENDING,
  [GrpcStatus.REJECTED]: SELLER_APPLICATION_STATUS.REJECTED,
} as const;

type ValidGrpcStatus = Exclude<
  GrpcStatus,
  GrpcStatus.UNSPECIFIED | GrpcStatus.UNRECOGNIZED
>;

export const sellerApplicationStatusMappings = {
  fromGrpc: (status: GrpcStatus): SellerApplicationStatus | null =>
    status in STATUS_MAP ? STATUS_MAP[status as ValidGrpcStatus] : status.toString() as SellerApplicationStatus,

  toGrpc: (status: SellerApplicationStatus): GrpcStatus =>
    GrpcStatus[status],
};
