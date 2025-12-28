import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class RemoveWishlistItemPayload extends PayloadWithUserInfo {
  @IsUUID()
  productId!: string;
}
