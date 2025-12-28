import { PayloadWithUserInfo } from "../../base.payload";
import { ImagePayload } from "../../image.payload";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength, ValidateNested } from "class-validator";

export class CreateSellerReviewPayload extends PayloadWithUserInfo {
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

  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => ImagePayload)
  images!: ImagePayload[];
}
