import { IsBuffer } from "../../common/validators/is-buffer.validator";
import { WithTokenPayload } from "../../with-token.payload";
import { Buffer } from "node:buffer";

export class SetProfilePicturePayload extends WithTokenPayload {
  @IsBuffer()
  image!: Buffer;
}
