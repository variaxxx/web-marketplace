import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { BaseGrpcClient } from "../../shared/common/base-grpc.client";
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { SellerApplicationServiceClient } from "@web-marketplace/contracts/gen/seller-application";

@Injectable()
export class SellerApplicationClientGrpc extends BaseGrpcClient<SellerApplicationServiceClient> {
  public constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.SELLER_APPLICATION_GRPC) grpcClient: ClientGrpc,
  ) {
    super(grpcClient, GRPC_SERVICE_NAMES.SELLER_APPLICATION_SERVICE);
  }
}
