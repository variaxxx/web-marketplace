import { ApiProperty } from "@nestjs/swagger";

export class FindManyApiResponse<T = any> {
  @ApiProperty({ example: 123 })
  total!: number;

  @ApiProperty({ example: 67 })
  count!: number;

  @ApiProperty()
  items!: T[];

  constructor(partial: Partial<FindManyApiResponse<T>>) {
    Object.assign(this, partial);
  }
}

export class ApiResponse<T = any> {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: "OK" })
  message!: string;

  @ApiProperty()
  data!: T;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }
}
