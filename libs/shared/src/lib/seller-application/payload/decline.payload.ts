import { IsOptional, IsString, IsUUID } from "class-validator";

export class DeclineSellerApplicationPayload {
  @IsUUID()
  applicationId!: string;

  @IsString()
  @IsOptional()
  note?: string;
}
