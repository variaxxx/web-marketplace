import { RmqService } from "../../infra/rmq/rmq.service";
import { AuthService } from "./auth.service";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, GrpcMethod, Payload, RmqContext } from "@nestjs/microservices";
import { AUTH_RMQ_PATTERN, ChangeUserRolePayload, RevokeRefreshTokenPayload } from "@web-marketplace/backend";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { LoginPayload, RefreshTokenPayload, RegistrationPayload, RegistrationResponse, TokensResponse, VerifyEmailPayload } from "@web-marketplace/contracts/gen/auth";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rmqService: RmqService,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.AUTH_SERVICE, "Login")
  async login(
    payload: LoginPayload,
  ): Promise<TokensResponse> {
    return await this.authService.login(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.AUTH_SERVICE, "Registration")
  async registration(
    payload: RegistrationPayload,
  ): Promise<RegistrationResponse> {
    return await this.authService.registration(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.AUTH_SERVICE, "RefreshToken")
  async refreshToken(
    payload: RefreshTokenPayload,
  ): Promise<TokensResponse> {
    return await this.authService.refreshToken(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.AUTH_SERVICE, "VerifyEmail")
  async verifyEmail(
    payload: VerifyEmailPayload,
  ): Promise<TokensResponse> {
    return await this.authService.verifyEmail(payload);
  }

  @EventPattern(AUTH_RMQ_PATTERN.REVOKE_REFRESH_TOKEN)
  async revokeRefreshToken(
    @Payload() payload: RevokeRefreshTokenPayload,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    try {
      await this.authService.revokeRefreshToken(payload);
      this.rmqService.ack(ctx);
    } catch {
      this.rmqService.nack(ctx);
    }
  }

  @EventPattern(AUTH_RMQ_PATTERN.CHANGE_USER_ROLE)
  async changeUserRole(
    @Payload() payload: ChangeUserRolePayload,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    try {
      await this.authService.changeUserRole(payload);
      this.rmqService.ack(ctx);
    } catch {
      this.rmqService.nack(ctx, true);
    }
  }
}
