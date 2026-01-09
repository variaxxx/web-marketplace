import { IsEmail, IsUUID } from "class-validator";

export class UserRegisteredPayload {
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string;
}
