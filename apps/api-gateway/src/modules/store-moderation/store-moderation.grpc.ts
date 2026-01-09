import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { BaseGrpcClient } from "../../shared/common/base-grpc.client";
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { StoreModerationServiceClient } from "@web-marketplace/contracts/gen/store";

@Injectable()
export class StoreModerationClientGrpc extends BaseGrpcClient<StoreModerationServiceClient> {
  public constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.STORE_MODERATION_GRPC) grpcClient: ClientGrpc,
  ) {
    super(grpcClient, GRPC_SERVICE_NAMES.STORE_MODERATION_SERVICE);
  }
}
