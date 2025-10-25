import { Device } from "../auth.types";
import { IsObject, IsString } from "class-validator";

export class VerifyEmailPayload {
  @IsString()
  token!: string;

  @IsObject()
  device!: Device;
}
