import { USER_ROLE, UserRole } from "../enums";
import { IsIn, IsUUID } from "class-validator";

export class ChangeUserRolePayload {
  @IsUUID()
  userId!: string;

  @IsIn(Object.values(USER_ROLE))
  role!: UserRole;
}
