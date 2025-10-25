import { IsString } from "class-validator";

export class TokenResponse {
  @IsString()
  accessToken!: string;
}
