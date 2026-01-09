import { ApiProperty } from "@nestjs/swagger";
import { RejectStoreEditRequest as SharedInterface } from "@web-marketplace/api";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class RejectStoreEditRequest implements SharedInterface {
  @ApiProperty({ example: "" })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  rejectionReason?: string;
}
