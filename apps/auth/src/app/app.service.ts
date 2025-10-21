import { PrismaService } from "../db/prisma.service";
import { EnvKey } from "./app.module";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RpcException } from "@nestjs/microservices";
import { LoginDto, RefreshTokenDto, RegistrationDto, TokenResponseDto, TokensResponseDto } from "@web-marketplace/shared";
import * as argon from "argon2";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async refreshToken(
    payload: RefreshTokenDto,
  ): Promise<TokensResponseDto> {
    try {
      const tokenPayload: TokenPayload = await this.jwtService.verifyAsync(payload.refreshToken, {
        secret: this.configService.getOrThrow<string>(EnvKey.REFRESH_JWT_SECRET),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: tokenPayload.userId },
        select: { refresh_tokens: true },
      });

      let isValidToken: boolean = false;
      for (const token of user.refresh_tokens) {
        isValidToken = await argon.verify(token.tokenHash, payload.refreshToken);
        if (isValidToken)
          break;
      }
      if (!isValidToken) {
        throw new RpcException({
          status: 401,
          message: "Invalid token",
        });
      }

      const tokens = await this.createTokens({
        userId: tokenPayload.userId,
        email: tokenPayload.email,
        role: tokenPayload.role,
      });

      return tokens;
    } catch {
      throw new RpcException({
        status: 401,
        message: "Invalid token",
      });
    }
  }

  async login(
    payload: LoginDto,
  ): Promise<TokensResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });
    if (!user || user.status === "INACTIVE") {
      throw new RpcException({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = argon.verify(user.passwordHash, payload.password);
    if (!isValidPassword) {
      throw new RpcException({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const tokens = await this.createTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    this.writeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async register(
    payload: RegistrationDto,
  ): Promise<TokenResponseDto> {
    const hashedPassword = await argon.hash(payload.password);

    try {
      const user = await this.prisma.user.upsert({
        where: { email: payload.email, status: "INACTIVE" },
        create: {
          name: payload.name,
          email: payload.email,
          passwordHash: hashedPassword,
          role: "USER",
          status: "INACTIVE",
        },
        update: {
          name: payload.name,
          passwordHash: hashedPassword,
          role: "USER",
        },
      });

      const tokens = await this.createTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      return {
        accessToken: tokens.accessToken,
      };
    } catch (e) {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 400,
          message: "Client already exists",
        });
      }
    }
  }

  private async writeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await argon.hash(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashedToken,
      },
    });
  }

  async createTokens(
    userData: TokenPayload,
  ): Promise<TokensResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        userData,
        {
          secret: this.configService.getOrThrow<string>(EnvKey.ACCESS_JWT_SECRET),
          expiresIn: "15m",
        },
      ),
      this.jwtService.signAsync(
        userData,
        {
          secret: this.configService.getOrThrow<string>(EnvKey.REFRESH_JWT_SECRET),
          expiresIn: "7d",
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
