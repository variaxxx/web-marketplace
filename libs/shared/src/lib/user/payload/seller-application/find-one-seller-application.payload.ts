import { WithTokenPayload } from "../../../with-token.payload";
import { IsUUID } from "class-validator";

export class FindOneSellerApplicationPayload extends WithTokenPayload {
  @IsUUID()
  applicationId!: string;
}
