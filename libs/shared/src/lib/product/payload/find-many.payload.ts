import { IsIn, IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManyProductsPayload {
  @IsIn(["asc", "desc"])
  order!: "asc" | "desc";

  @IsInt()
  @IsPositive()
  limit!: number;

  @IsInt()
  @IsPositive()
  offset!: number;

  @IsUUID()
  @IsOptional()
  sellerId?: string;
}
