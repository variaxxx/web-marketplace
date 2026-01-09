import { ApiProperty } from "@nestjs/swagger";
import { StoreInfoResponse as SharedInterface } from "@web-marketplace/api";

export class StoreInfoResponse implements SharedInterface {
  @ApiProperty({ example: "670000ad-939d-4d60-89d2-bdef684b98d4" })
  id: string;

  @ApiProperty({ example: null })
  avatarUrl: string | null;

  @ApiProperty({ example: "My store description" })
  description: string | null;

  @ApiProperty({ example: "My store name" })
  name: string;
}
