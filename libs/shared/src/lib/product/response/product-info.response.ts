import { ProductStatus } from "../product.types";
import { IsDate, IsIn, IsInt, IsPositive, IsString, IsUUID } from "class-validator";

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

  @IsIn(Object.values(ProductStatus))
  status!: ProductStatus;

  @IsInt()
  @IsPositive()
  priceCents!: number;

  @IsString()
  category!: string;
}
