import { ArrayMaxSize, IsArray } from "class-validator";

export class FindProductsByIdsPayload {
  @IsArray()
  @ArrayMaxSize(20)
  ids!: string[];
}
