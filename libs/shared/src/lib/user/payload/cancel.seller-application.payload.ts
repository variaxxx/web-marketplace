import { WithTokenPayload } from "../../with-token.payload";
import { IsUUID } from "class-validator";

export class CancelSellerApplicationPayload extends WithTokenPayload {
  @IsUUID()
  applicationId!: string;
}
