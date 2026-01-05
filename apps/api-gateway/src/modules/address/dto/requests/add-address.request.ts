import { ApiProperty } from "@nestjs/swagger";
import { AddAddressRequest as SharedInterface } from "@web-marketplace/api";
import { Trim } from "@web-marketplace/backend";
import { IsLatitude, IsLongitude, IsOptional, IsString, MaxLength } from "class-validator";

export class AddAddressRequest implements SharedInterface {
  @ApiProperty({ example: "Moscow" })
  @IsString()
  @MaxLength(128)
  @Trim()
  city: string;

  @ApiProperty({ example: "Pushkin`s street" })
  @IsString()
  @MaxLength(128)
  @Trim()
  street: string;

  @ApiProperty({ example: "1/2" })
  @IsString()
  @MaxLength(128)
  @Trim()
  house: string;

  @ApiProperty({ example: 55.7524 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 37.6108 })
  @IsLongitude()
  longitude: number;

  @ApiProperty({ example: "My house" })
  @IsString()
  @MaxLength(100)
  @Trim()
  @IsOptional()
  label?: string;
}
