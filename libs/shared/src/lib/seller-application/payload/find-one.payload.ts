import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class FindOneSellerApplicationPayload extends PayloadWithUserInfo {
  @IsUUID()
  applicationId!: string;
}
