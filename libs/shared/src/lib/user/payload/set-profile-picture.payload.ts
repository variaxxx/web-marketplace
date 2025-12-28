import { PayloadWithUserInfo } from "../../base.payload";
import { ImagePayload } from "../../image.payload";
import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";

export class SetProfilePicturePayload extends PayloadWithUserInfo {
  @IsDefined()
  @ValidateNested()
  @Type(() => ImagePayload)
  image!: ImagePayload;
}
