import { WithTokenPayload } from "../../with-token.payload";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class EditCategoryPayload extends WithTokenPayload {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  slugNode?: string;
}
