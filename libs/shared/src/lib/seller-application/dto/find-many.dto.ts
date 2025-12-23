import { SELLER_APPLICATION_STATUS } from "../constants";
import { SellerApplicationStatus } from "../types";
import { IsIn, IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManySellerApplicationsDto {
  @IsIn(Object.values(SELLER_APPLICATION_STATUS))
  @IsOptional()
  status?: SellerApplicationStatus;

  @IsInt()
  @IsPositive()
  @IsOptional()
  count?: number;

  @IsUUID()
  @IsOptional()
  lastId?: string;
}
