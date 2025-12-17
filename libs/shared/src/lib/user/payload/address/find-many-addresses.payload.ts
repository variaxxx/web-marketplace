import { WithTokenPayload } from "../../../with-token.payload";
import { IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManyAddressesPayload extends WithTokenPayload {
  @IsInt()
  @IsPositive()
  @IsOptional()
  count?: number;

  @IsUUID()
  @IsOptional()
  lastId?: string;
}
