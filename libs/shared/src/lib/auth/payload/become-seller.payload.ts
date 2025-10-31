import { IsUUID } from "class-validator";

export class BecomeSellerPayload {
  @IsUUID()
  userId!: string;
}
