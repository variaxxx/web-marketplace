import { IsDate, IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class AddressResponse {
  @IsUUID()
  id!: string;

  @IsDate()
  createdAt!: Date;

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
