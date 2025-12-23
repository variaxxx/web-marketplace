import { WithTokenPayload } from "../../with-token.payload";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateSellerApplicationPayload extends WithTokenPayload {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  storeName!: string;

  @IsString()
  @MaxLength(300)
  storeDescription!: string;
}
