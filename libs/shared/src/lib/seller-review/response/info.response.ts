import { IsArray, IsDate, IsInt, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from "class-validator";

export class SellerReviewInfoResponse {
  @IsUUID()
  id!: string;

  @IsDate()
  createdAt!: Date;

  @IsInt()
  @IsPositive()
  @Max(5)
  rating!: number;

  @IsString()
  @MaxLength(300)
  comment!: string;

  @IsUUID()
  sellerId!: string;

  @IsUUID()
  @IsOptional()
  relatedProductId?: string;

  @IsString()
  @IsOptional()
  relatedProductName?: string;

  @IsArray()
  pictureUrls!: string[];
}
