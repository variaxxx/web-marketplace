import { LoginPayload, RefreshTokenPayload, RegistrationDto, RevokeRefreshTokenPayload, TokenResponse, TokensResponse, VerifyEmailPayload } from "../../../../libs/shared/src";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("appController", () => {
  let controller: AppController;
  let service: AppService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            refreshToken: jest.fn(),
            verifyEmail: jest.fn(),
            revokeRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
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

      (service.register as jest.Mock).mockResolvedValue(token);

      const res = await controller.register(payload);

      expect(service.register).toHaveBeenCalledWith(payload);
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
});
