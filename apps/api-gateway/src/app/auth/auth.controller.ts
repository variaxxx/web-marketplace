import { BaseRpcController } from "../base-rpc.controller";
import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, Res } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { AUTH_PATTERNS, Device, LoginDto, LoginPayload, MicroserviceName, RefreshTokenPayload, RegistrationDto, RevokeRefreshTokenPayload, TokenResponse, TokensAges, TokensResponse, VerifyEmailDto, VerifyEmailPayload } from "@web-marketplace/shared";
import { Request, Response } from "express";
import { UAParser } from "ua-parser-js";

@Controller("auth")
export class AuthController extends BaseRpcController {
  constructor(
    @Inject(MicroserviceName.AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {
    super();
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const ua = req.headers["user-agent"];
    const device = this.getDeviceFromUa(ua);

    const value = await this.send<LoginPayload, TokensResponse>(
      this.authClient,
      AUTH_PATTERNS.LOGIN,
      {
        ...dto,
        device,
      },
    );

    this.setTokenAsCookie(res, "accessToken", value.accessToken, TokensAges.accessToken);
    this.setTokenAsCookie(res, "refreshToken", value.refreshToken, TokensAges.refreshToken);
  }

  @Post("registration")
  @HttpCode(HttpStatus.CREATED)
  async registration(
    @Body() dto: RegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const value = await this.send<RegistrationDto, TokenResponse>(
      this.authClient,
      AUTH_PATTERNS.REGISTRATION,
      dto,
    );

    this.setTokenAsCookie(res, "accessToken", value.accessToken, TokensAges.accessToken);
  }

  @Post("refreshToken")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      throw new BadRequestException("No refresh token provided");

    const ua = req.headers["user-agent"];
    const device = this.getDeviceFromUa(ua);

    const value = await this.send<RefreshTokenPayload, TokensResponse>(
      this.authClient,
      AUTH_PATTERNS.REFRESH_TOKEN,
      {
        refreshToken,
        device,
      },
    );

    this.setTokenAsCookie(res, "accessToken", value.accessToken, TokensAges.accessToken);
    this.setTokenAsCookie(res, "refreshToken", value.refreshToken, TokensAges.refreshToken);
  }

  @Post("verifyEmail")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const ua = req.headers["user-agent"];
    const device = this.getDeviceFromUa(ua);

    const value = await this.send<VerifyEmailPayload, TokensResponse>(
      this.authClient,
      AUTH_PATTERNS.VERIFY_EMAIL,
      {
        ...dto,
        device,
      },
    );

    this.setTokenAsCookie(res, "accessToken", value.accessToken, TokensAges.accessToken);
    this.setTokenAsCookie(res, "refreshToken", value.refreshToken, TokensAges.refreshToken);
  }

  @Post("revokeRefreshToken")
  @HttpCode(HttpStatus.OK)
  async revokeRefreshToken(
    @Req() req: Request,
  ): Promise<void> {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      throw new BadRequestException("No refresh token provided");

    return void this.emit<RevokeRefreshTokenPayload>(
      this.authClient,
      AUTH_PATTERNS.REVOKE_REFRESH_TOKEN,
      { refreshToken },
    );
  }

  private setTokenAsCookie(
    res: Response,
    name: string,
    token: string,
    maxAge: number,
  ): void {
    res.cookie(name, token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge,
    });
  }

  private getDeviceFromUa(
    ua?: string,
  ): Device {
    if (!ua)
      return {};

    const parsedUa = new UAParser(ua);

    return {
      browserName: parsedUa.getBrowser().name,
      deviceModel: parsedUa.getDevice().model,
      deviceVendor: parsedUa.getDevice().vendor,
      engineName: parsedUa.getEngine().name,
      osName: parsedUa.getOS().name,
    };
  }
}
