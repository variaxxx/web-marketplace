import { ApiProperty } from "@nestjs/swagger";
import { StoreEditRequestResponse as SharedInterface, UserDisplayInfoResponse, ValueChangeResponse } from "@web-marketplace/api";
import { StoreEditRequestStatus } from "@web-marketplace/backend";

export class StoreEditRequestResponse implements SharedInterface {
  @ApiProperty({ example: "69721e8b-3d26-4d31-941a-14b92e799d78" })
  id: string;

  @ApiProperty({ example: "2026-01-03T18:18:06.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "670000ad-939d-4d60-89d2-bdef684b98d4" })
  storeId: string;

  @ApiProperty({ example: "REJECTED" })
  status: StoreEditRequestStatus;

  @ApiProperty({ example: [{
    action: "SET",
    fieldName: "name",
    oldValue: "My store name",
    newValue: "My new store name",
  }] })
  changes: ValueChangeResponse[];

  @ApiProperty({ example: "2026-01-03T18:18:06.000Z" })
  decisionMadeAt?: Date;

  @ApiProperty({ example: {
    id: "670000ad-939d-4d60-89d2-bdef684b98d4",
    name: "ADMIN",
    avatarUrl: null,
  } })
  reviewedBy?: UserDisplayInfoResponse;

  @ApiProperty({ example: "I didn't like it" })
  rejectionReason?: string;
}
