import { IsArray, IsString, IsUUID } from "class-validator";

export class CategoryInfoResponse {
  @IsUUID()
  id!: string;

  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsArray()
  children!: CategoryInfoResponse[];
}
