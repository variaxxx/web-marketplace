import { ApiProperty } from "@nestjs/swagger";
import { LoginRequest as SharedInterface } from "@web-marketplace/api";
import { Trim } from "@web-marketplace/backend";
import { IsString, MinLength } from "class-validator";

export class LoginRequest implements SharedInterface {
  @ApiProperty({ example: "test@gmail.com" })
  @IsString()
  @Trim()
  @MinLength(3)
  email: string;

  @ApiProperty({ example: "123123" })
  @IsString()
  @Trim()
  @MinLength(1)
  password: string;
}
