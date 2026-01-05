import { BadRequestException } from "@nestjs/common";
import { extname } from "node:path";

export function pictureFileFilter(req: any, file: any, cb: any): void {
  if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`Unsupported file type ${extname(file.originalname)}`), false);
  }
}
