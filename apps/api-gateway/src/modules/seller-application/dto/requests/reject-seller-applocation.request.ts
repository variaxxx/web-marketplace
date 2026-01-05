import { ApiProperty } from "@nestjs/swagger";
import { RejectSellerApplicationRequest as SharedInterface } from "@web-marketplace/api";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class RejectSellerApplicationRequest implements SharedInterface {
  @ApiProperty({ example: "I didn't like it", nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  rejectionReason?: string;
}
