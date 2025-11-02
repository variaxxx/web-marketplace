import { WithOptionalTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class GetUserInfoPayload extends WithOptionalTokenPayload {
  @IsUUID()
  userId!: string;
}
