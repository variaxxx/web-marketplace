import { BadRequestException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export function normalizeText(
  value: string,
  field: string,
  exceptionType: "http" | "rpc" = "rpc",
): string {
  const v = value?.trim();
  if (!v || !v.length) {
    if (exceptionType === "rpc") {
      throw new RpcException({
        status: 400,
        message: `Invalid ${field}`,
      });
    } else {
      throw new BadRequestException(`Invalid ${field}`);
    }
  }
  return v;
}
