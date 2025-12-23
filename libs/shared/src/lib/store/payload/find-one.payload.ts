import { IsUUID } from "class-validator";

export class FindOneStorePayload {
  @IsUUID()
  ownerId!: string;
}
