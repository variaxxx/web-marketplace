import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class DeleteProductPayload extends WithTokenPayload {
  @IsUUID()
  id!: string;
}
