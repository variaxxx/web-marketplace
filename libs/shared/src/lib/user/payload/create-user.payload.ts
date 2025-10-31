import { IsUUID } from "class-validator";

export class CreateUserPayload {
  @IsUUID()
  id!: string;
}
