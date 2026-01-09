import { ApiProperty } from "@nestjs/swagger";
import { EditStoreInfoRequest as SharedInterface } from "@web-marketplace/api";
import { IsIn, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

export class EditStoreInfoRequest implements SharedInterface {
  @ApiProperty({ example: "New store name", required: false, nullable: true })
  @IsString()
  @MaxLength(64)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "New store description", required: false, nullable: true })
  @IsOptional()
  @ValidateIf(o => o.description !== null)
  @IsString()
  @MaxLength(256)
  description?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsIn(["true", "false"])
  @IsOptional()
  removeAvatar?: "true" | "false";
}
