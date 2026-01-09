import { ApiProperty } from "@nestjs/swagger";
import { SellerApplicationInfoResponse as SharedInterface, UserDisplayInfoResponse } from "@web-marketplace/api";
import { SellerApplicationStatus } from "@web-marketplace/backend";

export class SellerApplicationInfoResponse implements SharedInterface {
  @ApiProperty({ example: "4726d341-85f3-4139-8656-c9a163786edc" })
  id: string;

  @ApiProperty({ example: "2026-01-03T18:18:06.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "4726d341-85f3-4139-8656-c9a163786edc" })
  userId: string;

  @ApiProperty({ example: "PENDING" })
  status: SellerApplicationStatus;

  @ApiProperty({ example: "MyStore" })
  storeName: string;

  @ApiProperty({ example: "This is my store" })
  storeDescription: string | null;

  @ApiProperty({ example: "2026-01-03T18:18:06.000Z", nullable: true })
  decisionMadeAt?: Date;

  @ApiProperty({ example: {
    id: "4726d341-85f3-4139-8656-c9a163786edc",
    name: "The average internet user",
    avatarUrl: "avatar/4726d341-85f3-4139-8656-c9a163786edc",
  } })
  reviewedBy?: UserDisplayInfoResponse;

  @ApiProperty({ example: "I didn`t like it" })
  rejectionReason?: string;
}
