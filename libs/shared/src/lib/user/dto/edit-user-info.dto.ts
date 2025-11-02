import { IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class EditUserInfoDto {
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;
}
