import { ApiProperty } from "@nestjs/swagger";
import { UserInfoResponse as SharedInterface } from "@web-marketplace/api";

export class UserInfoResponse implements SharedInterface {
  @ApiProperty({ example: "avatars/120810924852394" })
  avatarUrl: string | null;

  @ApiProperty({ example: "The average internet user" })
  name: string | null;

  @ApiProperty({ example: "89991231122" })
  phone: string | null;
}
