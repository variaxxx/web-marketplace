import { ApiProperty } from "@nestjs/swagger";
import { StoreEditRequestResponse as SharedInterface, UserDisplayInfoResponse, ValueChangeResponse } from "@web-marketplace/api";
import { StoreEditRequestStatus } from "@web-marketplace/backend";

export class StoreEditRequestResponse implements SharedInterface {
  @ApiProperty({ example: "" })
  id: string;

  @ApiProperty({ example: "" })
  createdAt: Date;

  @ApiProperty({ example: "" })
  storeId: string;

  @ApiProperty({ example: "" })
  status: StoreEditRequestStatus;

  @ApiProperty({ example: "" })
  changes: ValueChangeResponse[];

  @ApiProperty({ example: "" })
  decisionMadeAt?: Date;

  @ApiProperty({ example: "" })
  reviewedBy?: UserDisplayInfoResponse;
}
