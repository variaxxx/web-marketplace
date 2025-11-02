import { IsString, IsUUID } from "class-validator";

export class StoreInfoResponse {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  avatarUrl!: string | null;
}
