import { AuthTokenPayload } from "./auth";
import { Type } from "class-transformer";
import { IsDefined, IsOptional, ValidateNested } from "class-validator";

export class PayloadWithUserInfo {
  @IsDefined()
  @ValidateNested()
  @Type(() => AuthTokenPayload)
  userInfo!: AuthTokenPayload;
}

export class PayloadWithOptionalUserInfo {
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthTokenPayload)
  userInfo?: AuthTokenPayload;
}
