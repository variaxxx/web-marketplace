import { IsUUID } from "class-validator";

export class UserRegisteredPayload {
  @IsUUID()
  id!: string;
}
