import { IsEmail, IsInt } from "class-validator";

export class SendEmailVerificationPayload {
  @IsEmail()
  recipient!: string;

  @IsInt()
  code!: number;
}
