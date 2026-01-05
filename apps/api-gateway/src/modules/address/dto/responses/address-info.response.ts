import { ApiProperty } from "@nestjs/swagger";
import { AddressInfoResponse as SharedInterface } from "@web-marketplace/api";

export class AddressInfoResponse implements SharedInterface {
  @ApiProperty({ example: "4726d341-85f3-4139-8656-c9a163786edc" })
  id: string;

  @ApiProperty({ example: "2026-01-03T18:18:06.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "Moscow" })
  city: string;

  @ApiProperty({ example: "Pushkin`s street" })
  street: string;

  @ApiProperty({ example: "1/2" })
  house: string;

  @ApiProperty({ example: 55.7524 })
  latitude: number;

  @ApiProperty({ example: 37.6108 })
  longitude: number;

  @ApiProperty({ example: "My house", nullable: true })
  label: string | null;
}
