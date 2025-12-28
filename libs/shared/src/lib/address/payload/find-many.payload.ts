import { PayloadWithUserInfo } from "../../base.payload";
import { IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManyAddressesPayload extends PayloadWithUserInfo {
  @IsInt()
  @IsPositive()
  @IsOptional()
  count?: number;

  @IsUUID()
  @IsOptional()
  lastId?: string;
}
