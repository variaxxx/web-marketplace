import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateSellerApplicationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  storeName!: string;

  @IsString()
  @MaxLength(300)
  storeDescription!: string;
}
