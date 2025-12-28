import { USER_ROLE, UserRole } from "../../constants";
import { IsEmail, IsIn, IsUUID } from "class-validator";

export class AuthTokenPayload {
  @IsUUID()
  userId!: string;

  @IsEmail()
  email!: string;

  @IsIn(Object.values(USER_ROLE))
  role!: UserRole;
}

export interface EmailVerificationTokenPayload {
  userId: string;
  email: string;
}
