import { AppService } from "./app.service";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AUTH_PATTERNS, LoginDto, RefreshTokenDto, RegistrationDto, RegistrationResponseDto, TokenResponseDto } from "@web-marketplace/shared";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(
    @Payload() payload: LoginDto,
  ): Promise<TokenResponseDto> {
    return await this.appService.login(payload);
  }

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  async register(
    @Payload() payload: RegistrationDto,
  ): Promise<RegistrationResponseDto> {
    return await this.appService.register(payload);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(
    @Payload() payload: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    return await this.appService.refreshToken(payload);
  }
}
