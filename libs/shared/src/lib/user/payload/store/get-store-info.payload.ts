import { IsUUID } from "class-validator";

export class GetStoreInfoPayload {
  @IsUUID()
  ownerId!: string;
}
