import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class ProductSearchPayload {
  @IsString()
  @MaxLength(256)
  query!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  minPrice?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  maxPrice?: number;
}
