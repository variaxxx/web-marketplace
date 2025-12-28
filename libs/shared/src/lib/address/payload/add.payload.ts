import { PayloadWithUserInfo } from "../../base.payload";
import { IsLatitude, IsLongitude, IsOptional, IsString, MaxLength } from "class-validator";

export class AddAddressPayload extends PayloadWithUserInfo {
  @IsString()
  city!: string;

  @IsString()
  street!: string;

  @IsString()
  house!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  label?: string;
}
