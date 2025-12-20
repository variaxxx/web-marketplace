import { CreateProductDto } from "./create.dto";
import { PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMaxSize, IsArray } from "class-validator";

export class EditProductDto extends PartialType(CreateProductDto) {
  @Transform(({ value }) => {
    if (!value)
      return [];
    if (Array.isArray(value))
      return value;
    return [value];
  })
  @IsArray()
  @ArrayMaxSize(5)
  existingImages!: string[];
}
