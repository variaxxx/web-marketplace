import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { BaseGrpcClient } from "../../shared/common/base-grpc.client";
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { AuthServiceClient } from "@web-marketplace/contracts/gen/auth";

@Injectable()
export class AuthClientGrpc extends BaseGrpcClient<AuthServiceClient> {
  public constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.AUTH_GRPC) grpcClient: ClientGrpc,
  ) {
    super(grpcClient, GRPC_SERVICE_NAMES.AUTH_SERVICE);
  }
}
