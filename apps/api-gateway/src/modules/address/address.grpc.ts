import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { BaseGrpcClient } from "../../shared/common/base-grpc.client";
import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { AddressServiceClient } from "@web-marketplace/contracts/gen/address";

@Injectable()
export class AddressClientGrpc extends BaseGrpcClient<AddressServiceClient> {
  public constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.ADDRESS_GRPC) grpcClient: ClientGrpc,
  ) {
    super(grpcClient, GRPC_SERVICE_NAMES.ADDRESS_SERVICE);
  }
}
