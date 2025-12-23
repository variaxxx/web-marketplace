import { IsOptional, IsString, MaxLength } from "class-validator";

export class EditCategoryDto {
  @IsString()
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  slugNode?: string;
}
