import { WithTokenPayload } from "../../with-token.payload";
import { ImagePayload } from "./image.payload";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsInt, IsPositive, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";

export class CreateProductPayload extends WithTokenPayload {
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  name!: string;

  @IsString()
  @MinLength(0)
  @MaxLength(512)
  description!: string;

  @IsString()
  categoryId!: string;

  @IsInt()
  @IsPositive()
  priceCents!: number;

  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ImagePayload)
  images!: ImagePayload[];
}
