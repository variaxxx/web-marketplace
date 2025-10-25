import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class RpcAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = context.switchToRpc().getData().accessToken;

    try {
      if (!token)
        throw new Error("No token provided");

      await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>("ACCESS_JWT_SECRET"),
      });
      return true;
    } catch {
      throw new RpcException({
        status: 403,
        message: "Forbidden",
      });
    }
  }
}
