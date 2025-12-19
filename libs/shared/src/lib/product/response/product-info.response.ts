import { PRODUCT_STATUS, ProductStatus } from "../product.types";
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
  category!: string;

  @IsArray()
  pictureUrls!: string[];
}
