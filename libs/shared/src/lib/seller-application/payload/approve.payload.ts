import { IsUUID } from "class-validator";

export class ApproveSellerApplicationPayload {
  @IsUUID()
  applicationId!: string;
}
