import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class RemoveWishlistItemPayload extends WithTokenPayload {
  @IsUUID()
  productId!: string;
}
