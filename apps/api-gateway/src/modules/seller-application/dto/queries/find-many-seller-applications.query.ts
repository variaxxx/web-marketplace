import { SELLER_APPLICATION_STATUS, SellerApplicationStatus, SORT_ORDER, SortOrder } from "@web-marketplace/backend";
import { IsEnum, IsInt, IsOptional, IsPositive } from "class-validator";

export class FindManySellerApplicationsQuery {
  @IsEnum(SELLER_APPLICATION_STATUS)
  @IsOptional()
  status?: SellerApplicationStatus;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @IsEnum(SORT_ORDER)
  @IsOptional()
  sortOrder?: SortOrder;
}
