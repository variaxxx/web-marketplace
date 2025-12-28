import { PayloadWithUserInfo } from "../../base.payload";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class FindManyWishlistItemsPayload extends PayloadWithUserInfo {
  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
