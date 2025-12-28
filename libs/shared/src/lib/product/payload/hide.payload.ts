import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class HideProductPayload extends PayloadWithUserInfo {
  @IsUUID()
  id!: string;
}
