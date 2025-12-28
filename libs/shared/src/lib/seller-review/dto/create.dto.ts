import { IsInt, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from "class-validator";

export class CreateSellerReviewDto {
  @IsInt()
  @IsPositive()
  @Max(5)
  rating!: number;

  @IsString()
  @MaxLength(300)
  @IsOptional()
  comment?: string;

  @IsUUID()
  sellerId!: string;

  @IsUUID()
  @IsOptional()
  relatedProductId?: string;
}
