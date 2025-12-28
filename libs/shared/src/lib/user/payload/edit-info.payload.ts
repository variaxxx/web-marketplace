import { PayloadWithUserInfo } from "../../base.payload";
import { IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class EditUserInfoPayload extends PayloadWithUserInfo {
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;
}
