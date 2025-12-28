import { EnvKey } from "../../app/app.module";
import { ROLES_KEY } from "../decorators/allowed-roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/is-public.decorator";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthTokenPayload, USER_ROLE, UserRole } from "@web-marketplace/shared";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.accessToken;

    const allowedRoles = this.reflector.get<UserRole[]>(ROLES_KEY, context.getHandler()) || Object.values(USER_ROLE);
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler()) || false;

    if (!token) {
      if (!isPublic) {
        throw new UnauthorizedException("Unauthorized");
      }
      return true;
    }

    const tokenPayload: AuthTokenPayload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow<string>(EnvKey.ACCESS_JWT_SECRET),
    }).catch(() => {
      throw new UnauthorizedException("Unauthorized");
    });

    if (!isPublic && !allowedRoles.includes(tokenPayload.role)) {
      throw new ForbiddenException("Forbidden");
    }

    (request as any).userInfo = {
      email: tokenPayload.email,
      role: tokenPayload.role,
      userId: tokenPayload.userId,
    } as AuthTokenPayload;
    return true;
  }
}
