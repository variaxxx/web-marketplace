import { IsUUID } from "class-validator";

export class FindOneCategoryPayload {
  @IsUUID()
  categoryId!: string;
}
