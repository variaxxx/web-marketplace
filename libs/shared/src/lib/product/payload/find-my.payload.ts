import { WithTokenPayload } from "../../with-token.payload";
import { IsIn, IsInt, IsOptional, IsPositive } from "class-validator";

export class FindMyProductsPayload extends WithTokenPayload {
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
