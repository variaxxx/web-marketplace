import { IsBuffer } from "./common";
import { IsIn, IsInt, IsPositive, IsString } from "class-validator";
import { Buffer } from "node:buffer";

export class ImagePayload {
  @IsBuffer()
  buffer!: Buffer;

  @IsString()
  originalName!: string;

  @IsString()
  @IsIn(["image/jpeg", "image/png", "image/webp", "image/gif"])
  mimetype!: string;

  @IsInt()
  @IsPositive()
  size!: number;
}
