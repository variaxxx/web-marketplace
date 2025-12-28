import { PayloadWithUserInfo } from "../../base.payload";
import { IsUUID } from "class-validator";

export class DeleteProductPayload extends PayloadWithUserInfo {
  @IsUUID()
  id!: string;
}
