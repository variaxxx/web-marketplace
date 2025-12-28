import { PayloadWithUserInfo } from "../../base.payload";
import { IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class EditAddressPayload extends PayloadWithUserInfo {
  @IsUUID()
  addressId!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  house?: string;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  label?: string;
}
