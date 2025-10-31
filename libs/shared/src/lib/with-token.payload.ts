import { IsJWT } from "class-validator";

export class WithTokenPayload {
  @IsJWT()
  accessToken!: string;
}
