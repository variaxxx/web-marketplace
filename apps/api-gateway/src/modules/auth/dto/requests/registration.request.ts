import { ApiProperty } from "@nestjs/swagger";
import { RegistrationRequest as SharedInterface } from "@web-marketplace/api";
import { Trim } from "@web-marketplace/backend";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegistrationRequest implements SharedInterface {
  @ApiProperty({ example: "test@gmail.com" })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({ example: "123123" })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Trim()
  password: string;
}
