import { IsJWT, IsOptional } from "class-validator";

export class WithTokenPayload {
  @IsJWT()
  accessToken!: string;
}

export class WithOptionalTokenPayload {
  @IsJWT()
  @IsOptional()
  accessToken?: string;
}
