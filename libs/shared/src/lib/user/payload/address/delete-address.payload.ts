import { WithTokenPayload } from "../../../with-token.payload";
import { IsUUID } from "class-validator";

export class DeleteAddressPayload extends WithTokenPayload {
  @IsUUID()
  addressId!: string;
}
