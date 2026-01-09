import { SORT_ORDER, SortOrder, STORE_EDIT_REQUEST_STATUS, StoreEditRequestStatus } from "@web-marketplace/backend";
import { IsEnum, IsIn, IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManyStoreEditRequestsQuery {
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @IsEnum(STORE_EDIT_REQUEST_STATUS)
  @IsOptional()
  status?: StoreEditRequestStatus;

  @IsUUID()
  @IsOptional()
  storeId?: string;

  @IsEnum(SORT_ORDER)
  @IsOptional()
  sortOrder?: SortOrder;

  @IsIn(["createdAt", "decisionMadeAt"])
  @IsOptional()
  sortBy?: "createdAt" | "decisionMadeAt";
}
