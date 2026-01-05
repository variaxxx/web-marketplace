import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { BaseGrpcClient } from "../../shared/common/base-grpc.client";
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { UserServiceClient } from "@web-marketplace/contracts/gen/user";

@Injectable()
export class UserClientGrpc extends BaseGrpcClient<UserServiceClient> {
  public constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.USER_GRPC) grpcClient: ClientGrpc,
  ) {
    super(grpcClient, GRPC_SERVICE_NAMES.USER_SERVICE);
  }
}
