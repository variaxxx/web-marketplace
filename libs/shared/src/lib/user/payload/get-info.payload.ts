import { PayloadWithOptionalUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class GetUserInfoPayload extends PayloadWithOptionalUserInfo {
  @IsUUID()
  userId!: string;
}
