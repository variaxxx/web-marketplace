import { IsBoolean, IsDate, IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class SellerApplicationReviewedPayload {
  @IsEmail()
  userEmail!: string;

  @IsBoolean()
  isApproved!: boolean;

  @IsString()
  storeName!: string;

  @IsUUID()
  applicationId!: string;

  @IsDate()
  decisionMadeAt!: Date;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
