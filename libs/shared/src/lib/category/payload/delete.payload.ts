import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class DeleteCategoryPayload extends PayloadWithUserInfo {
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  redirectCategoryId!: string;
}
