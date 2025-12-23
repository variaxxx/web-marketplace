import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class PutProductForSalePayload extends WithTokenPayload {
  @IsUUID()
  productId!: string;
}
