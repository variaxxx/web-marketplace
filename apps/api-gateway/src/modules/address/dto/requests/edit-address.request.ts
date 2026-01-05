import { ApiProperty } from "@nestjs/swagger";
import { EditAddressRequest as SharedInterface } from "@web-marketplace/api";
import { Trim } from "@web-marketplace/backend";
import { IsLatitude, IsLongitude, IsOptional, IsString, MaxLength } from "class-validator";

export class EditAddressRequest implements SharedInterface {
  @ApiProperty({ example: "Moscow", nullable: true })
  @IsString()
  @MaxLength(128)
  @Trim()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: "Pushkin`s street", nullable: true })
  @IsString()
  @MaxLength(128)
  @Trim()
  @IsOptional()
  street?: string;

  @ApiProperty({ example: "1/2", nullable: true })
  @IsString()
  @MaxLength(128)
  @Trim()
  @IsOptional()
  house?: string;

  @ApiProperty({ example: 55.7524, nullable: true })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 37.6108, nullable: true })
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: "My house", nullable: true })
  @IsString()
  @MaxLength(128)
  @Trim()
  @IsOptional()
  label?: string;
}
