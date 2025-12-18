import { PrismaService } from "../../db/prisma.service";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthTokenPayload, CreateUserPayload, Device, EmailVerificationTokenPayload, MAIL_PATTERNS, MicroserviceName, SendEmailVerificationDto, USER_PATTERNS } from "@web-marketplace/shared";
import * as argon from "argon2";

const mockDevice: Device = {
  browserName: "Mozilla",
};

jest.mock("argon2", () => ({
  verify: jest.fn(),
  hash: jest.fn(),
}));

describe("authService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let mailClient: ClientProxy;
  let userClient: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              upsert: jest.fn(),
            },
            refreshToken: {
              delete: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue("secretJwt"),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue("secret"),
          },
        },
        {
          provide: MicroserviceName.MAIL_SERVICE,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: MicroserviceName.USER_SERVICE,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    mailClient = module.get<ClientProxy>(MicroserviceName.MAIL_SERVICE);
    userClient = module.get<ClientProxy>(MicroserviceName.USER_SERVICE);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyEmail", () => {
    it("should activate user and return tokens", async () => {
      (jwt.verifyAsync as jest.Mock).mockResolvedValue({
        email: "test@gmail.com",
        userId: "123",
      } as EmailVerificationTokenPayload);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: "123",
        role: "USER",
      });

      // createTokens
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: "123",
      });

      const res = await service.verifyEmail({ token: "token", device: mockDevice });

      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
      expect(jwt.verifyAsync).toHaveBeenCalledWith("token", expect.any(Object));
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(userClient.emit).toHaveBeenCalledWith(USER_PATTERNS.USER.CREATE, {
        id: "123",
      } as CreateUserPayload);
    });

    it("should throw RpcException if invalid token", async () => {
      (jwt.verifyAsync as jest.Mock).mockRejectedValue(new Error("Invalid token"));

      await expect(service.verifyEmail({
        token: "invalid",
        device: mockDevice,
      })).rejects.toThrow(RpcException);

      expect(jwt.verifyAsync).toHaveBeenCalledWith("invalid", expect.any(Object));
    });
  });

  describe("refreshToken", () => {
    it("should return new tokens", async () => {
      (jwt.verifyAsync as jest.Mock).mockResolvedValue({
        email: "test@gmail.com",
        role: "USER",
        userId: "123",
      } as AuthTokenPayload);
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: "123",
      });
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({
        id: "123",
      });

      // createTokens
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: "123",
      });

      const res = await service.refreshToken({
        refreshToken: "refreshToken",
        device: mockDevice,
      });

      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
      expect(jwt.verifyAsync).toHaveBeenCalledWith("refreshToken", expect.any(Object));
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should throw RpcException if invalid token", async () => {
      (jwt.verifyAsync as jest.Mock).mockRejectedValue(new Error("Invalid token"));

      await expect(service.refreshToken({
        refreshToken: "invalid",
        device: mockDevice,
      })).rejects.toThrow(RpcException);

      expect(jwt.verifyAsync).toHaveBeenCalledWith("invalid", expect.any(Object));
    });
  });

  describe("login", () => {
    it("should return token for valid credentials", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "123",
        role: "USER",
        status: "ACTIVE",
        passwordHash: "hash",
      });
      (argon.verify as jest.Mock).mockResolvedValue(true);

      // createTokens
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: "123",
      });

      const res = await service.login({
        email: "test@gmail.com",
        device: mockDevice,
        password: "123123",
      });

      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
      expect(argon.verify).toHaveBeenCalledWith("hash", "123123");
    });

    it("should throw RpcException if invalid credentials", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "123",
        role: "USER",
        status: "ACTIVE",
        passwordHash: "hash",
      });
      jest.spyOn(argon, "verify").mockResolvedValue(false);

      await expect(service.login({
        email: "test@gmail.com",
        device: mockDevice,
        password: "123123",
      })).rejects.toThrow(RpcException);
    });
  });

  describe("registration", () => {
    it("should create a user, emit email verification and return token", async () => {
      (argon.hash as jest.Mock).mockResolvedValue("hash");
      (prisma.user.upsert as jest.Mock).mockResolvedValue({
        id: "123",
        email: "test@gmail.com",
        role: "USER",
      });

      // createTokens
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: "123",
      });

      const res = await service.registration({
        email: "test@gmail.com",
        password: "123123",
      });

      expect(res.accessToken).toBeDefined();
      expect(mailClient.emit).toHaveBeenCalledWith(
        MAIL_PATTERNS.SEND_EMAIL_VERIFICATION,
        {
          recipient: "test@gmail.com",
          token: "secretJwt",
        } as SendEmailVerificationDto,
      );
      expect(prisma.user.upsert).toHaveBeenCalled();
    });

    it("should throw RpcException if client already exists", async () => {
      (prisma.user.upsert as jest.Mock).mockRejectedValue({ code: "P2002" });

      await expect(
        service.registration({
          email: "test@gmail.com",
          password: "123123",
        }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe("revokeRefreshToken", () => {
    it("should delete refresh token", async () => {
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({
        id: "123",
      });

      await service.revokeRefreshToken({
        refreshToken: "refreshToken",
      });

      expect(prisma.refreshToken.delete).toHaveBeenCalled();
    });
  });

  describe("becomeSeller", () => {
    it("should update user", async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: "123",
      });

      await service.becomeSeller({
        userId: "123",
      });

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
