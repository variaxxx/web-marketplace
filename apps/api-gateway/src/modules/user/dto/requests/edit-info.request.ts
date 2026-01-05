import { ApiProperty } from "@nestjs/swagger";
import { EditUserInfoRequest as SharedInterface } from "@web-marketplace/api";
import { Trim } from "@web-marketplace/backend";
import { IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class EditUserInfoRequest implements SharedInterface {
  @ApiProperty({ example: "89991231122", nullable: true })
  @IsPhoneNumber()
  @Trim()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "The average internet user", nullable: true })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Trim()
  name?: string;
}
