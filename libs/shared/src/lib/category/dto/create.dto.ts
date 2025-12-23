import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(64)
  slugNode!: string;

  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;
}
