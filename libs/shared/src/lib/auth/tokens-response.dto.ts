import { IsString } from "class-validator";

export class TokensResponseDto {
  @IsString()
  accessToken!: string;

  @IsString()
  refreshToken!: string;
}
