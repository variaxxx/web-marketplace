import { GRPC_ERROR_CODE } from "../enums";
import { MicroserviceError } from "../errors";
import { BadRequestException } from "@nestjs/common";

export function normalizeText(
  value: string,
  field: string,
  exceptionType: "http" | "rpc" = "rpc",
): string {
  const v = value?.trim();
  if (!v || !v.length) {
    if (exceptionType === "rpc") {
      throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, `Invalid ${field}`);
    } else {
      throw new BadRequestException(`Invalid ${field}`);
    }
  }
  return v;
}
