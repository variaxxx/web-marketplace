import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class AddWishlistItemPayload extends WithTokenPayload {
  @IsUUID()
  productId!: string;
}
