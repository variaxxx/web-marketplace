import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class AddWishlistItemPayload extends PayloadWithUserInfo {
  @IsUUID()
  productId!: string;
}
