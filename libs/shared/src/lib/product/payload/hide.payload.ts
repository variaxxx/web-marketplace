import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class HideProductPayload extends WithTokenPayload {
  @IsUUID()
  id!: string;
}
