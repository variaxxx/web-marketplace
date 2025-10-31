import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Test, TestingModule } from "@nestjs/testing";
import { BecomeSellerPayload, LoginPayload, RefreshTokenPayload, RegistrationDto, RevokeRefreshTokenPayload, TokenResponse, TokensResponse, VerifyEmailPayload } from "@web-marketplace/shared";

describe("authController", () => {
  let controller: AuthController;
  let service: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            registration: jest.fn(),
            refreshToken: jest.fn(),
            verifyEmail: jest.fn(),
            revokeRefreshToken: jest.fn(),
            becomeSeller: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe("login", () => {
    it("should call service and return result", async () => {
      const payload = {
        email: "test@gmail.com",
        device: {
          browserName: "Mozilla",
        },
        password: "123123",
      } as LoginPayload;
      const tokens = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      } as TokensResponse;

      (service.login as jest.Mock).mockResolvedValue(tokens);

      const res = await controller.login(payload);

      expect(service.login).toHaveBeenCalledWith(payload);
      expect(res).toEqual(tokens);
    });
  });

  describe("register", () => {
    it("should call service and return result", async () => {
      const payload = {
        email: "test@gmail.com",
        name: "Tester",
        password: "123123",
      } as RegistrationDto;
      const token = {
        accessToken: "accessToken",
      } as TokenResponse;

      (service.registration as jest.Mock).mockResolvedValue(token);

      const res = await controller.registration(payload);

      expect(service.registration).toHaveBeenCalledWith(payload);
      expect(res).toEqual(token);
    });
  });

  describe("refreshToken", () => {
    it("should call service and return result", async () => {
      const payload = {
        device: {
          browserName: "Mozilla",
        },
        refreshToken: "refreshToken",
      } as RefreshTokenPayload;
      const tokens = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      } as TokensResponse;

      (service.refreshToken as jest.Mock).mockResolvedValue(tokens);

      const res = await controller.refreshToken(payload);

      expect(service.refreshToken).toHaveBeenCalledWith(payload);
      expect(res).toEqual(tokens);
    });
  });

  describe("verifyEmail", () => {
    it("should call service and return result", async () => {
      const payload = {
        device: {
          browserName: "Mozilla",
        },
        token: "verifyToken",
      } as VerifyEmailPayload;
      const tokens = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      } as TokensResponse;

      (service.verifyEmail as jest.Mock).mockResolvedValue(tokens);

      const res = await controller.verifyEmail(payload);

      expect(service.verifyEmail).toHaveBeenCalledWith(payload);
      expect(res).toEqual(tokens);
    });
  });

  describe("revokeRefreshToken", () => {
    it("should call service and return result", async () => {
      const payload = {
        refreshToken: "refreshToken",
      } as RevokeRefreshTokenPayload;

      (service.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);

      await controller.revokeRefreshToken(payload);

      expect(service.revokeRefreshToken).toHaveBeenCalledWith(payload);
    });
  });

  describe("becomeSeller", () => {
    it("should call service", async () => {
      const payload = {
        userId: "123",
      } as BecomeSellerPayload;

      (service.becomeSeller as jest.Mock).mockResolvedValue(undefined);

      await controller.becomeSeller(payload);

      expect(service.becomeSeller).toHaveBeenCalledWith(payload);
    });
  });
});
