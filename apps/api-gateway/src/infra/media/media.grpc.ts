import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { BaseGrpcClient } from "../../shared/common/base-grpc.client";
import { Inject } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { MediaServiceClient } from "@web-marketplace/contracts/gen/media";

export class MediaClientGrpc extends BaseGrpcClient<MediaServiceClient> {
  public constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.MEDIA_GRPC) grpcClient: ClientGrpc,
  ) {
    super(grpcClient, GRPC_SERVICE_NAMES.MEDIA_SERVICE);
  }
}
