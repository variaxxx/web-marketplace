import { Transform } from "class-transformer";
import { IsInt, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProductDto {
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

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsPositive()
  priceCents!: number;
}
