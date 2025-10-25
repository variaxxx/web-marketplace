import { IsString } from "class-validator";

export class RevokeRefreshTokenPayload {
  @IsString()
  refreshToken!: string;
}
