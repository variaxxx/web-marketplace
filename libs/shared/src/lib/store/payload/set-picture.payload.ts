import { ImagePayload } from "../../image.payload";
import { WithTokenPayload } from "../../with-token.payload";
import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";

export class SetStorePicturePayload extends WithTokenPayload {
  @IsDefined()
  @ValidateNested()
  @Type(() => ImagePayload)
  image!: ImagePayload;
}
