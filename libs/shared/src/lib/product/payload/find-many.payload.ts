import { IsIn, IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManyProductsPayload {
  @IsIn(["asc", "desc"])
  order!: "asc" | "desc";

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @IsUUID()
  @IsOptional()
  sellerId?: string;
}
