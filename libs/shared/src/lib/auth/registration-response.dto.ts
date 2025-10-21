import { IsString } from "class-validator";

export class RegistrationResponseDto {
  @IsString()
  accessToken!: string;
}
