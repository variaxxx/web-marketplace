import { Device } from "../types";
import { IsObject, IsString } from "class-validator";

export class RefreshTokenPayload {
  @IsString()
  refreshToken!: string;

  @IsObject()
  device!: Device;
}
