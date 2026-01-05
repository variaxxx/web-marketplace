import { GRPC_ERROR_CODE } from "../enums";
import { RpcException } from "@nestjs/microservices";

export class MicroserviceError extends RpcException {
  constructor(
    readonly code: GRPC_ERROR_CODE,
    readonly details: string,
  ) {
    super({
      code,
      details,
    });
  }
}
