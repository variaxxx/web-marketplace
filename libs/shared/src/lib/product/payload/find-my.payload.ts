import { PayloadWithUserInfo } from "../../base.payload";
import { IsIn, IsInt, IsOptional, IsPositive } from "class-validator";

export class FindMyProductsPayload extends PayloadWithUserInfo {
  @IsIn(["asc", "desc"])
  order!: "asc" | "desc";

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;
}
