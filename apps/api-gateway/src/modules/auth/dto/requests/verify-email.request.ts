import { ApiProperty } from "@nestjs/swagger";
import { VerifyEmailRequest as SharedInterface } from "@web-marketplace/api";
import { Trim } from "@web-marketplace/backend";
import { IsEmail, IsInt, Max, Min } from "class-validator";

export class VerifyEmailRequest implements SharedInterface {
  @ApiProperty({ example: "test@gmail.com" })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({ example: 123456 })
  @IsInt()
  @Min(100000)
  @Max(999999)
  code: number;
}
