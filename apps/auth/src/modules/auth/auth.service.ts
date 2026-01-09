import { EnvKey } from "../../core/config/env-key.enum";
import { MICROSERVICE_CLIENT_NAMES } from "../../core/config/microservice-client.names";
import { PrismaJsonObject, PrismaService } from "../../infra/db/prisma.service";
import { RedisService } from "../../infra/redis/redis.service";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ClientProxy } from "@nestjs/microservices";
import { AuthTokenPayload, ChangeUserRolePayload, GRPC_ERROR_CODE, MAIL_RMQ_PATTERN, MicroserviceError, MS_IN_MIN, normalizeText, PrismaQueryError, RevokeRefreshTokenPayload, SendEmailVerificationPayload, TOKEN_AGE, USER_RMQ_PATTERN, USER_ROLE, USER_STATUS, UserRegisteredPayload } from "@web-marketplace/backend";
import { Device, LoginPayload, RefreshTokenPayload, RegistrationPayload, RegistrationResponse, TokensResponse, VerifyEmailPayload } from "@web-marketplace/contracts/gen/auth";
import * as argon from "argon2";
import crypto, { createHash } from "node:crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(MICROSERVICE_CLIENT_NAMES.MAIL_RMQ) private readonly mailClient: ClientProxy,
    @Inject(MICROSERVICE_CLIENT_NAMES.USER_RMQ) private readonly userClient: ClientProxy,
  ) {}

  async changeUserRole(
    payload: ChangeUserRolePayload,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: payload.userId, status: "ACTIVE" },
      data: {
        role: payload.role,
      },
    });
  }

  async verifyEmail(
    payload: VerifyEmailPayload,
  ): Promise<TokensResponse> {
    const email = normalizeText(payload.email, "email").toLowerCase();

    const storedHash = await this.redis.get(`otp:${email}`);
    const providedHash = createHash("sha256").update(payload.code.toString()).digest("hex");

    if (storedHash !== providedHash) {
      throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Invalid code");
    }

    const user = await this.prisma.user.update({
      where: { email, status: "INACTIVE" },
      data: { status: "ACTIVE" },
      select: {
        id: true,
        role: true,
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound) {
        throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Email already verified");
      }
      throw e;
    });

    this.userClient.emit(USER_RMQ_PATTERN.USER_REGISTERED, {
      id: user.id,
    } as UserRegisteredPayload);

    await this.redis.del(`otp:${email}`);

    return await this.createTokens({
      email: payload.email,
      userId: user.id,
      role: user.role,
    }, { device: payload.device });
  }

  async refreshToken(
    payload: RefreshTokenPayload,
  ): Promise<TokensResponse> {
    const tokenPayload = await this.validateRefreshToken(payload.refreshToken).catch(() => {
      throw new MicroserviceError(GRPC_ERROR_CODE.UNAUTHENTICATED, "Invalid token");
    });

    if (tokenPayload === null) {
      throw new MicroserviceError(GRPC_ERROR_CODE.UNAUTHENTICATED, "Invalid token");
    }

    await this.revokeRefreshToken(payload);

    const tokens = await this.createTokens({
      userId: tokenPayload.userId,
      email: tokenPayload.email,
      role: tokenPayload.role,
    }, { device: payload.device });

    return tokens;
  }

  async login(
    payload: LoginPayload,
  ): Promise<TokensResponse> {
    const email = normalizeText(payload.email, "email").toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email, status: USER_STATUS.ACTIVE },
      select: {
        id: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (
      !user
      || !(await argon.verify(user.passwordHash, payload.password))
    ) {
      throw new MicroserviceError(GRPC_ERROR_CODE.UNAUTHENTICATED, "Invalid credentials");
    }

    const tokens = await this.createTokens({
      userId: user.id,
      email: payload.email,
      role: user.role,
    }, { device: payload.device });
    return tokens;
  }

  async registration(
    payload: RegistrationPayload,
  ): Promise<RegistrationResponse> {
    const email = normalizeText(payload.email, "email");
    const password = normalizeText(payload.password, "password");

    const hashedPassword = await argon.hash(password);

    await this.prisma.$transaction(async (tx) => {
      const candidate = await tx.user.findFirst({
        where: { email },
        select: { id: true, status: true },
      });

      if (candidate && candidate.status === USER_STATUS.ACTIVE)
        throw new MicroserviceError(GRPC_ERROR_CODE.ALREADY_EXISTS, "Client already exists");

      if (candidate && candidate.status === USER_STATUS.INACTIVE) {
        return await tx.user.update({
          where: { id: candidate.id },
          data: {
            passwordHash: hashedPassword,
            role: USER_ROLE.USER,
          },
        });
      }

      await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: USER_ROLE.USER,
          status: USER_STATUS.INACTIVE,
        },
      });
    });

    const storedHash = await this.redis.get(`otp:${email}`);
    if (storedHash)
      throw new MicroserviceError(GRPC_ERROR_CODE.ALREADY_EXISTS, "Unable to register now, please try again later");

    const code = crypto.randomInt(100000, 999999);
    const codeHash = createHash("sha256").update(code.toString()).digest("hex");

    await this.redis.set(`otp:${email}`, codeHash, MS_IN_MIN * 3);

    this.mailClient.emit(MAIL_RMQ_PATTERN.SEND_EMAIL_VERIFICATION, {
      recipient: email,
      code,
    } as SendEmailVerificationPayload);

    return {
      status: true,
    };
  }

  async revokeRefreshToken(
    payload: RevokeRefreshTokenPayload,
  ): Promise<void> {
    try {
      const tokenHash = this.hashToken(payload.refreshToken);

      await this.prisma.refreshToken.delete({
        where: { tokenHash },
        select: { id: true },
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
      select: {
        id: true,
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
          expiresIn: TOKEN_AGE.ACCESS_TOKEN,
        },
      ),
      this.jwtService.signAsync(
        userData,
        {
          secret: this.configService.getOrThrow<string>(EnvKey.REFRESH_JWT_SECRET),
          expiresIn: TOKEN_AGE.REFRESH_TOKEN,
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
