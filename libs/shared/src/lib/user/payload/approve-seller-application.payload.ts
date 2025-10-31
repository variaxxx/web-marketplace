import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class ApproveSellerApplicationPayload extends WithTokenPayload {
  @IsUUID()
  applicationId!: string;
}
