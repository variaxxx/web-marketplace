import { IsInt, IsOptional, IsPositive, IsUUID } from "class-validator";

export class FindManyAddressesDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  count?: number;

  @IsUUID()
  @IsOptional()
  lastId?: string;
}
