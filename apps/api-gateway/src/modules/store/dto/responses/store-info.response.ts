import { ApiProperty } from "@nestjs/swagger";
import { StoreInfoResponse as SharedInterface } from "@web-marketplace/api";

export class StoreInfoResponse implements SharedInterface {
  @ApiProperty({ example: "" })
  id: string;

  @ApiProperty({ example: "" })
  avatarUrl: string;

  @ApiProperty({ example: "" })
  description: string | null;

  @ApiProperty({ example: "" })
  name: string | null;
}
