import { AuthService } from "./auth.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AUTH_PATTERNS, BecomeSellerPayload, IsPublic, LoginPayload, RefreshTokenPayload, RegistrationPayload, RevokeRefreshTokenPayload, TokenResponse, TokensResponse, VerifyEmailPayload } from "@web-marketplace/shared";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(
    @Payload() payload: LoginPayload,
  ): Promise<TokensResponse> {
    return await this.authService.login(payload);
  }

  @IsPublic()
  @MessagePattern(AUTH_PATTERNS.REGISTRATION)
  async registration(
    @Payload() payload: RegistrationPayload,
  ): Promise<TokenResponse> {
    return await this.authService.registration(payload);
  }

  @IsPublic()
  @EventPattern(AUTH_PATTERNS.BECOME_SELLER)
  async becomeSeller(
    @Payload() payload: BecomeSellerPayload,
  ): Promise<void> {
    return await this.authService.becomeSeller(payload);
  }

  @IsPublic()
  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(
    @Payload() payload: RefreshTokenPayload,
  ): Promise<TokensResponse> {
    return await this.authService.refreshToken(payload);
  }

  @IsPublic()
  @MessagePattern(AUTH_PATTERNS.VERIFY_EMAIL)
  async verifyEmail(
    @Payload() payload: VerifyEmailPayload,
  ): Promise<TokensResponse> {
    return await this.authService.verifyEmail(payload);
  }

  @IsPublic()
  @EventPattern(AUTH_PATTERNS.REVOKE_REFRESH_TOKEN)
  async revokeRefreshToken(
    @Payload() payload: RevokeRefreshTokenPayload,
  ): Promise<void> {
    return await this.authService.revokeRefreshToken(payload);
  }
}
