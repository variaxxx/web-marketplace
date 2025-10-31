import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Req } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { ApproveSellerApplicationPayload, CancelSellerApplicationPayload, CreateSellerApplicationDto, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsDto, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, MicroserviceName, SellerApplicationResponse, USER_PATTERNS } from "@web-marketplace/shared";
import { Request } from "express";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("sellerApplication")
export class SellerApplicationController {
  constructor(
    @Inject(MicroserviceName.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSellerApplicationDto,
    @Req() req: Request,
  ): Promise<SellerApplicationResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.CREATE_SELLER_APPLICATION, {
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
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<SellerApplicationResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.CANCEL_SELLER_APPLICATION, {
      accessToken,
      applicationId: id,
    } as CancelSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Post(":id/decline")
  @HttpCode(HttpStatus.OK)
  async decline(
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<SellerApplicationResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.DECLINE_SELLER_APPLICATION, {
      accessToken,
      applicationId: id,
    } as DeclineSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<SellerApplicationResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.APPROVE_SELLER_APPLICATION, {
      accessToken,
      applicationId: id,
    } as ApproveSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Get("findMany")
  @HttpCode(HttpStatus.OK)
  async findMany(
    @Body() dto: FindManySellerApplicationsDto,
    @Req() req: Request,
  ): Promise<FindManyApiResponse<SellerApplicationResponse>> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.FIND_MANY_SELLER_APPLICATION, {
      accessToken,
      count: dto.count,
      lastId: dto.lastId,
      status: dto.status,
    } as FindManySellerApplicationsPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param("id") id: string,
    @Req() req: Request,
  ): Promise<SellerApplicationResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.userClient.send(USER_PATTERNS.FIND_ONE_SELLER_APPLICATION, {
      accessToken,
      applicationId: id,
    } as FindOneSellerApplicationPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
