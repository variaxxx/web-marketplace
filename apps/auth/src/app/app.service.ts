import { PrismaJsonObject, PrismaService } from "../db/prisma.service";
import { EnvKey } from "./app.module";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { AuthTokenPayload, Device, EmailVerificationTokenPayload, LoginPayload, MAIL_PATTERNS, MicroserviceName, MS_IN_HOUR, RefreshTokenPayload, RegistrationDto, RevokeRefreshTokenPayload, SendEmailVerificationDto, TokenResponse, TokensAges, TokensResponse, VerifyEmailPayload } from "@web-marketplace/shared";
import * as argon from "argon2";
import crypto from "node:crypto";

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(MicroserviceName.MAIL_SERVICE) private readonly mailClient: ClientProxy,
  ) {}

  async verifyEmail(
    payload: VerifyEmailPayload,
  ): Promise<TokensResponse> {
    try {
      const tokenPayload: EmailVerificationTokenPayload = await this.jwtService.verifyAsync(payload.token, {
        secret: this.configService.getOrThrow<string>(EnvKey.EMAIL_VERIFICATION_JWT_SECRET),
      });

      const user = await this.prisma.user.update({
        where: { id: tokenPayload.userId, email: tokenPayload.email, status: "INACTIVE" },
        data: { status: "ACTIVE" },
        select: { role: true },
      });

      return await this.createTokens({
        email: tokenPayload.email,
        userId: tokenPayload.userId,
        role: user.role,
      });
    } catch {
      throw new RpcException({
        status: 401,
        message: "Invalid token",
      });
    }
  }

  async refreshToken(
    payload: RefreshTokenPayload,
  ): Promise<TokensResponse> {
    try {
      const tokenPayload = await this.validateRefreshToken(payload.refreshToken);

      if (tokenPayload === null) {
        throw new RpcException({
          status: 401,
          message: "Invalid token",
        });
      }

      await this.revokeRefreshToken(payload);

      const tokens = await this.createTokens({
        userId: tokenPayload.userId,
        email: tokenPayload.email,
        role: tokenPayload.role,
      }, { device: payload.device });

      return tokens;
    } catch {
      throw new RpcException({
        status: 401,
        message: "Invalid token",
      });
    }
  }

  async login(
    payload: LoginPayload,
  ): Promise<TokensResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (
      !user
      || user.status === "INACTIVE"
      || !(await argon.verify(user.passwordHash, payload.password))
    ) {
      throw new RpcException({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const tokens = await this.createTokens({
      userId: user.id,
      email: payload.email,
      role: user.role,
    }, { device: payload.device });
    return tokens;
  }

  async register(
    payload: RegistrationDto,
  ): Promise<TokenResponse> {
    try {
      const hashedPassword = await argon.hash(payload.password);

      const user = await this.prisma.user.upsert({
        where: { email: payload.email, status: "INACTIVE", updatedAt: { lt: new Date(Date.now() - 1 * MS_IN_HOUR) } },
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

      const verificationToken = await this.jwtService.signAsync(
        {
          userId: user.id,
          email: payload.email,
        } as EmailVerificationTokenPayload,
        {
          secret: this.configService.getOrThrow<string>(EnvKey.EMAIL_VERIFICATION_JWT_SECRET),
          expiresIn: TokensAges.emailVerificationToken,
        },
      );

      this.mailClient.emit(MAIL_PATTERNS.SEND_EMAIL_VERIFICATION, {
        recipient: payload.email,
        token: verificationToken,
      } as SendEmailVerificationDto);

      const tokens = await this.createTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      }, { writeRefreshToken: false });
      return {
        accessToken: tokens.accessToken,
      };
    } catch (e) {
      if (e.code === "P2002") {
        throw new RpcException({
          status: 400,
          message: "Client already exists",
        });
      }
      throw e;
    }
  }

  async revokeRefreshToken(
    payload: RevokeRefreshTokenPayload,
  ): Promise<void> {
    try {
      const tokenHash = this.hashToken(payload.refreshToken);

      await this.prisma.refreshToken.delete({
        where: { tokenHash },
      });
    } catch {}
  }

  private async writeRefreshToken(
    userId: string,
    refreshToken: string,
    device: Device,
  ): Promise<void> {
    const hashedToken = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashedToken,
        device: device as PrismaJsonObject,
      },
    });
  }

  private async validateRefreshToken(
    refreshToken: string,
  ): Promise<AuthTokenPayload | null> {
    const tokenPayload: AuthTokenPayload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.getOrThrow<string>(EnvKey.REFRESH_JWT_SECRET),
    });
    const tokenHash = this.hashToken(refreshToken);
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { id: true },
    });

    return token.id ? tokenPayload : null;
  }

  private async createTokens(
    userData: AuthTokenPayload,
    options?: {
      writeRefreshToken?: boolean;
      device?: Device;
    },
  ): Promise<TokensResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        userData,
        {
          secret: this.configService.getOrThrow<string>(EnvKey.ACCESS_JWT_SECRET),
          expiresIn: TokensAges.accessToken,
        },
      ),
      this.jwtService.signAsync(
        userData,
        {
          secret: this.configService.getOrThrow<string>(EnvKey.REFRESH_JWT_SECRET),
          expiresIn: TokensAges.refreshToken,
        },
      ),
    ]);

    if (!options || (options && options.writeRefreshToken !== false))
      await this.writeRefreshToken(userData.userId, refreshToken, options.device);

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashToken(
    token: string,
  ): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
