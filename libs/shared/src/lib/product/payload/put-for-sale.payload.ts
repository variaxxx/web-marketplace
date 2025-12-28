import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class PutProductForSalePayload extends PayloadWithUserInfo {
  @IsUUID()
  productId!: string;
}
