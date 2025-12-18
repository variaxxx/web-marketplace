import { WithTokenPayload } from "../../with-token.payload";
import { IsInt, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

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
  category!: string;

  @IsInt()
  @IsPositive()
  priceCents!: number;
}
