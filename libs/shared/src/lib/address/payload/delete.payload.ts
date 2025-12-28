import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class DeleteAddressPayload extends PayloadWithUserInfo {
  @IsUUID()
  addressId!: string;
}
