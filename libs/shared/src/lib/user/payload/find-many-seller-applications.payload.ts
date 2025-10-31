import { WithTokenPayload } from "../../with-token.payload";
import { SellerApplicationStatus } from "../user.types";
import { IsIn, IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManySellerApplicationsPayload extends WithTokenPayload {
  @IsIn(Object.values(SellerApplicationStatus))
  @IsOptional()
  status?: SellerApplicationStatus;

  @IsInt()
  @IsPositive()
  @IsOptional()
  count?: number;

  @IsUUID()
  @IsOptional()
  lastId?: string;
}
