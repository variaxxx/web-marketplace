import { IsLatitude, IsLongitude, IsOptional, IsString, MaxLength } from "class-validator";

export class EditAddressDto {
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
