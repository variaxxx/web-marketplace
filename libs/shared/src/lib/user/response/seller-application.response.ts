import { SellerApplicationStatus } from "../user.types";
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from "class-validator";

export class SellerApplicationResponse {
  @IsUUID()
  id!: string;

  @IsDate()
  createdAt!: Date;

  @IsUUID()
  userId!: string;

  @IsIn(Object.values(SellerApplicationStatus))
  status!: SellerApplicationStatus;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  storeName!: string;

  @IsString()
  storeDescription!: string;
}
