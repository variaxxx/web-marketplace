import { AccessToken } from "../../common/decorators/access-token.decorator";
import { BaseRpcController } from "../base-rpc.controller";
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { ApproveSellerApplicationPayload, CancelSellerApplicationPayload, CreateSellerApplicationDto, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsDto, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, MicroserviceName, SellerApplicationResponse, USER_PATTERNS } from "@web-marketplace/shared";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("sellerApplication")
export class SellerApplicationController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AccessToken() accessToken: string,
    @Body() dto: CreateSellerApplicationDto,
  ): Promise<SellerApplicationResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SELLER_APPLICATION.CREATE, {
      accessToken,
      storeName: dto.storeName,
      storeDescription: dto.storeDescription,
    } as CreateSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancel(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SELLER_APPLICATION.CANCEL, {
      accessToken,
      applicationId: id,
    } as CancelSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Post(":id/decline")
  @HttpCode(HttpStatus.OK)
  async decline(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SELLER_APPLICATION.DECLINE, {
      accessToken,
      applicationId: id,
    } as DeclineSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  async approve(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SELLER_APPLICATION.APPROVE, {
      accessToken,
      applicationId: id,
    } as ApproveSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Get("findMany")
  @HttpCode(HttpStatus.OK)
  async findMany(
    @AccessToken() accessToken: string,
    @Body() dto: FindManySellerApplicationsDto,
  ): Promise<FindManyApiResponse<SellerApplicationResponse>> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SELLER_APPLICATION.FIND_MANY, {
      accessToken,
      ...dto,
    } as FindManySellerApplicationsPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @AccessToken() accessToken: string,
    @Param("id") id: string,
  ): Promise<SellerApplicationResponse> {
    return await firstValueFrom(this.userClient.send(USER_PATTERNS.SELLER_APPLICATION.FIND_ONE, {
      accessToken,
      applicationId: id,
    } as FindOneSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
