import { IsUUID } from "class-validator";

export class MarkAsSoldProductPayload {
  @IsUUID()
  productId!: string;
}
