import { WithTokenPayload } from "../../../with-token.payload";
import { IsUUID } from "class-validator";

export class FindOneAddressPayload extends WithTokenPayload {
  @IsUUID()
  addressId!: string;
}
