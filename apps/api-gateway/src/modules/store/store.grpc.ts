import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { BaseGrpcClient } from "../../shared/common/base-grpc.client";
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { StoreServiceClient } from "@web-marketplace/contracts/gen/store";

@Injectable()
export class StoreClientGrpc extends BaseGrpcClient<StoreServiceClient> {
  public constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.STORE_GRPC) grpcClient: ClientGrpc,
  ) {
    super(grpcClient, GRPC_SERVICE_NAMES.STORE_SERVICE);
  }
}
