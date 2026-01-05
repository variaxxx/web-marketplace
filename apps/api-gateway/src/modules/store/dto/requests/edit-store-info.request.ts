import { ApiProperty } from "@nestjs/swagger";
import { EditStoreInfoRequest as SharedInterface } from "@web-marketplace/api";
import { IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

export class EditStoreInfoRequest implements SharedInterface {
  @ApiProperty({ example: "" })
  @IsString()
  @MaxLength(64)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "" })
  @IsOptional()
  @ValidateIf(o => o.description !== null)
  @IsString()
  @MaxLength(256)
  description?: string | null;
}
