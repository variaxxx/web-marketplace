import { ApiProperty } from "@nestjs/swagger";
import { CreateSellerApplicationRequest as SharedInterface } from "@web-marketplace/api";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSellerApplicationRequest implements SharedInterface {
  @ApiProperty({ example: "MyStore" })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  storeName: string;

  @ApiProperty({ example: "This is my store" })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  storeDescription?: string;
}
