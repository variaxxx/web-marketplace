import { PRODUCT_STATUS } from "../constants";
import { ProductStatus } from "../types";
import { IsArray, IsDate, IsIn, IsInt, IsPositive, IsString, IsUUID } from "class-validator";

export class ProductInfoResponse {
  @IsUUID()
  id!: string;

  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;

  @IsUUID()
  sellerId!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsIn(Object.values(PRODUCT_STATUS))
  status!: ProductStatus;

  @IsInt()
  @IsPositive()
  priceCents!: number;

  @IsString()
  categoryName!: string;

  @IsArray()
  pictureUrls!: string[];
}
