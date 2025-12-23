import { ImagePayload } from "../../image.payload";
import { WithTokenPayload } from "../../with-token.payload";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength, ValidateNested } from "class-validator";

export class EditProductPayload extends WithTokenPayload {
  @IsUUID()
  id!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(0)
  @MaxLength(512)
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  priceCents?: number;

  @IsArray()
  @ArrayMaxSize(5)
  existingImages!: string[];

  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ImagePayload)
  newImages!: ImagePayload[];
}
