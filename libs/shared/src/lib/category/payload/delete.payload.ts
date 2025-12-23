import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class DeleteCategoryPayload extends WithTokenPayload {
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  redirectCategoryId!: string;
}
