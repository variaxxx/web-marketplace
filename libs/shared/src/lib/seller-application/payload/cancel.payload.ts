import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class CancelSellerApplicationPayload extends PayloadWithUserInfo {
  @IsUUID()
  applicationId!: string;
}
