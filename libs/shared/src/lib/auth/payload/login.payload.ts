import { Device } from "../auth.types";
import { IsObject, IsString } from "class-validator";

export class LoginPayload {
  @IsString()
  email!: string;

  @IsString()
  password!: string;

  @IsObject()
  device!: Device;
}
