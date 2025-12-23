import { SELLER_APPLICATION_STATUS } from "../constants";
import { SellerApplicationStatus } from "../types";
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from "class-validator";

export class SellerApplicationInfoResponse {
  @IsUUID()
  id!: string;

  @IsDate()
  createdAt!: Date;

  @IsUUID()
  userId!: string;

  @IsIn(Object.values(SELLER_APPLICATION_STATUS))
  status!: SellerApplicationStatus;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  storeName!: string;

  @IsString()
  storeDescription!: string;
}
