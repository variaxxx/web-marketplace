import { BadRequestException, Body, Controller, Get, Inject, Post, Query, Req } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { CreateProductDto, CreateProductPayload, FindManyApiResponse, MicroserviceName, PRODUCT_PATTERNS, ProductInfoResponse, ProductSearchPayload } from "@web-marketplace/shared";
import { Request } from "express";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("product")
export class ProductController {
  constructor(
    @Inject(MicroserviceName.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  @Get("search")
  async search(
    @Query("query") query: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @Query("category") category?: string,
    @Query("minPrice") minPrice?: number,
    @Query("maxPrice") maxPrice?: number,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    if (!query) {
      throw new BadRequestException("No query provided");
    }

    return await firstValueFrom(this.productClient.send(PRODUCT_PATTERNS.SEARCH, {
      query,
      limit,
      offset,
      category,
      minPrice,
      maxPrice,
    } as ProductSearchPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ): Promise<ProductInfoResponse> {
    const accessToken = req.cookies.accessToken;

    return await firstValueFrom(this.productClient.send(PRODUCT_PATTERNS.CREATE, {
      ...dto,
      accessToken,
    } as CreateProductPayload).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }
}
