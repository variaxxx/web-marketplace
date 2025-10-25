import { AppService } from "./app.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AUTH_PATTERNS, LoginPayload, RefreshTokenPayload, RegistrationDto, RevokeRefreshTokenPayload, TokenResponse, TokensResponse, VerifyEmailPayload } from "@web-marketplace/shared";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(
    @Payload() payload: LoginPayload,
  ): Promise<TokensResponse> {
    return await this.appService.login(payload);
  }

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  async register(
    @Payload() payload: RegistrationDto,
  ): Promise<TokenResponse> {
    return await this.appService.register(payload);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(
    @Payload() payload: RefreshTokenPayload,
  ): Promise<TokensResponse> {
    return await this.appService.refreshToken(payload);
  }

  @MessagePattern(AUTH_PATTERNS.VERIFY_EMAIL)
  async verifyEmail(
    @Payload() payload: VerifyEmailPayload,
  ): Promise<TokensResponse> {
    return await this.appService.verifyEmail(payload);
  }

  @EventPattern(AUTH_PATTERNS.REVOKE_REFRESH_TOKEN)
  async revokeRefreshToken(
    @Payload() payload: RevokeRefreshTokenPayload,
  ): Promise<void> {
    return await this.appService.revokeRefreshToken(payload);
  }
}
