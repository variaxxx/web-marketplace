import { IsIn, IsInt, IsPositive, IsString } from "class-validator";

export class ImagePayload {
  @IsString()
  url!: string;

  @IsString()
  originalName!: string;

  @IsString()
  @IsIn(["image/jpeg", "image/png", "image/webp", "image/gif"])
  mimetype!: string;

  @IsInt()
  @IsPositive()
  size!: number;
}
