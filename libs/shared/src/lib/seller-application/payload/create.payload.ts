import { PayloadWithUserInfo } from "../../base.payload";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateSellerApplicationPayload extends PayloadWithUserInfo {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  storeName!: string;

  @IsString()
  @MaxLength(300)
  storeDescription!: string;
}
