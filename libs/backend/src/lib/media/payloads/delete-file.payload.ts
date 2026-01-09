import { IsString } from "class-validator";

export class DeleteFilePayload {
  @IsString()
  url!: string;
}
