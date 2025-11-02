import { IsOptional, IsPhoneNumber, IsString, IsUrl } from "class-validator";

export class UserInfoResponse {
  @IsPhoneNumber("RU")
  @IsOptional()
  phone?: string | null;

  @IsString()
  name!: string | null;

  @IsUrl()
  avatarUrl!: string | null;
}
