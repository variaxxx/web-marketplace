import { IsBuffer } from "../../../validators/is-buffer.validator";
import { WithTokenPayload } from "../../../with-token.payload";
import { Buffer } from "node:buffer";

export class SetStorePicturePayload extends WithTokenPayload {
  @IsBuffer()
  image!: Buffer;
}
