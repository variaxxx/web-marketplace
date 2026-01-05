import { BadRequestException } from "@nestjs/common";
import { Transform } from "class-transformer";

export function Trim(): PropertyDecorator {
  return Transform(({ value, key }) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed.length)
        throw new BadRequestException(`Invalid ${key}`);
      return trimmed;
    }
    return value;
  });
}
