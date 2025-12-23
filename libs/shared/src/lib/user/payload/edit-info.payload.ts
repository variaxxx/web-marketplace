import { WithTokenPayload } from "../../with-token.payload";
import { IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class EditUserInfoPayload extends WithTokenPayload {
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;
}
