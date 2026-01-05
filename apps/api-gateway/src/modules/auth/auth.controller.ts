import { ApiFormattedResponse, IsPublic } from "../../shared";
import { AuthClientGrpc } from "./auth.grpc";
import { AuthClientRmq } from "./auth.rmq";
import { LoginRequest, RegistrationRequest, VerifyEmailRequest } from "./dto/requests";
import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { TokensAges } from "@web-marketplace/backend";
import { Device } from "@web-marketplace/contracts/gen/auth";
import { Request, Response } from "express";
import { UAParser } from "ua-parser-js";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly grpcClient: AuthClientGrpc,
    private readonly rmqClient: AuthClientRmq,
  ) {}

  @ApiOperation({ summary: "Login to account" })
  @ApiFormattedResponse(HttpStatus.OK)
  @IsPublic()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const ua = req.headers["user-agent"];
    const device = this.getDeviceFromUa(ua);

    const value = await this.grpcClient.call("login", {
      device,
      ...dto,
    });

    this.setTokenAsCookie(res, "accessToken", value.accessToken, TokensAges.accessToken);
    this.setTokenAsCookie(res, "refreshToken", value.refreshToken, TokensAges.refreshToken);
  }

  @ApiOperation({ summary: "Account registration" })
  @ApiFormattedResponse(HttpStatus.CREATED)
  @IsPublic()
  @Post("registration")
  @HttpCode(HttpStatus.CREATED)
  async registration(
    @Body() dto: RegistrationRequest,
  ): Promise<void> {
    await this.grpcClient.call("registration", dto);
  }

  @ApiOperation({ summary: "Access token renewal" })
  @ApiFormattedResponse(HttpStatus.OK)
  @Post("refresh-token")
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

    const value = await this.grpcClient.call("refreshToken", {
      refreshToken,
      device,
    });

    this.setTokenAsCookie(res, "accessToken", value.accessToken, TokensAges.accessToken);
    this.setTokenAsCookie(res, "refreshToken", value.refreshToken, TokensAges.refreshToken);
  }

  @ApiOperation({ summary: "Email verification" })
  @ApiFormattedResponse(HttpStatus.OK)
  @IsPublic()
  @Post("email/verify")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() dto: VerifyEmailRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const ua = req.headers["user-agent"];
    const device = this.getDeviceFromUa(ua);

    const value = await this.grpcClient.call("verifyEmail", {
      ...dto,
      device,
    });

    this.setTokenAsCookie(res, "accessToken", value.accessToken, TokensAges.accessToken);
    this.setTokenAsCookie(res, "refreshToken", value.refreshToken, TokensAges.refreshToken);
  }

  @ApiOperation({ summary: "Logout" })
  @ApiFormattedResponse(HttpStatus.OK)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async revokeRefreshToken(
    @Req() req: Request,
  ): Promise<void> {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      throw new BadRequestException("No refresh token provided");

    this.rmqClient.revokeRefreshToken({
      refreshToken,
    });
  }

  private setTokenAsCookie(
    res: Response,
    name: string,
    token: string,
    maxAge: number,
  ): void {
    res.cookie(name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
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
