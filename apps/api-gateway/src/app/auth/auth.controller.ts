import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Res } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { AUTH_PATTERNS, LoginDto, MicroserviceName, MS_IN_DAY, RefreshTokenDto, RegistrationDto, RegistrationResponseDto, TokenResponseDto, TokensResponseDto } from "@web-marketplace/shared";
import { Response } from "express";
import { catchError, firstValueFrom, throwError } from "rxjs";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(MicroserviceName.AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res() response: Response,
  ): Promise<TokenResponseDto> {
    const value: TokensResponseDto = await firstValueFrom(this.authClient.send(AUTH_PATTERNS.LOGIN, dto).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));

    response.cookie("refreshToken", value.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * MS_IN_DAY,
    });

    return {
      accessToken: value.accessToken,
    };
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegistrationDto,
  ): Promise<RegistrationResponseDto> {
    return await firstValueFrom(this.authClient.send(AUTH_PATTERNS.REGISTER, dto).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));
  }

  @Post("refreshToken")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Res() response: Response,
  ): Promise<TokenResponseDto> {
    const value: TokensResponseDto = await firstValueFrom(this.authClient.send(AUTH_PATTERNS.REFRESH_TOKEN, dto).pipe(
      catchError(error => throwError(() => new RpcException(error))),
    ));

    response.cookie("refreshToken", value.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * MS_IN_DAY,
    });

    return {
      accessToken: value.accessToken,
    };
  }
}
