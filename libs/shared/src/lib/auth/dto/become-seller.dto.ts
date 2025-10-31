import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class BecomeSellerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  storeName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  storeDescription?: string;

  storePicture?: File;
}
