import { WithTokenPayload } from "../../with-token.payload";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class FindManyWishlistItemsPayload extends WithTokenPayload {
  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
