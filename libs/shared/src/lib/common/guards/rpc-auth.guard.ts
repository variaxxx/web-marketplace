import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { RpcException } from "@nestjs/microservices";
import { AuthTokenPayload, ROLES_KEY, UserRole } from "@web-marketplace/shared";

@Injectable()
export class RpcAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcCtx = context.switchToRpc();
    const token = rpcCtx.getData().accessToken;
    const meta = rpcCtx.getContext();
    const allowedRoles = this.reflector.get<UserRole[]>(ROLES_KEY, context.getHandler()) || [];

    if (!token) {
      throw new RpcException({
        status: 401,
        message: "Unauthorized",
      });
    }

    const tokenPayload: AuthTokenPayload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow<string>("ACCESS_JWT_SECRET"),
    }).catch(() => {
      throw new RpcException({
        status: 401,
        message: "Unauthorized",
      });
    });

    if (!allowedRoles.includes(tokenPayload.role as UserRole)) {
      throw new RpcException({
        status: 403,
        message: "Forbidden",
      });
    }

    meta.jwtPayload = tokenPayload;
    return true;
  }
}
