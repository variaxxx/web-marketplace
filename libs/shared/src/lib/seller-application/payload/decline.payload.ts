import { WithTokenPayload } from "../../with-token.payload";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class DeclineSellerApplicationPayload extends WithTokenPayload {
  @IsUUID()
  applicationId!: string;

  @IsString()
  @IsOptional()
  note?: string;
}
