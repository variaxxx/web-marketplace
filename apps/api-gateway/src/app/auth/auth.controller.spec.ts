import { MicroserviceName, TokensResponse } from "../../../../../libs/shared/src";
import { AuthController } from "./auth.controller";
import { BadRequestException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { of, throwError } from "rxjs";

function mockResponse() {
  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
}

function mockRequest(cookies = {}, userAgent = "Mozilla/5.0") {
  return {
    cookies,
    headers: { "user-agent": userAgent },
  };
}

describe("authController", () => {
  let controller: AuthController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: MicroserviceName.AUTH_SERVICE,
          useValue: {
            send: jest.fn(),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    clientProxy = module.get<ClientProxy>(MicroserviceName.AUTH_SERVICE);
  });

  it("should set cookies on successful login", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const mockTokens: TokensResponse = {
      accessToken: "access123",
      refreshToken: "refresh321",
    };

    (clientProxy.send as jest.Mock).mockReturnValue(of(mockTokens));

    await controller.login({ email: "test@gmail.com", password: "123123" }, req as any, res as any);

    expect(clientProxy.send).toHaveBeenCalled();

    expect(res.cookie).toHaveBeenCalledWith(
      "accessToken",
      "access123",
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "refresh321",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("should throw error if refresh token is missing", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await expect(controller.refreshToken(req as any, res as any)).rejects.toThrow(BadRequestException);
  });

  it("should refresh tokens successfully", async () => {
    const req = mockRequest({ refreshToken: "oldRefresh" });
    const res = mockResponse();
    const mockTokens: TokensResponse = {
      accessToken: "newAccess",
      refreshToken: "newRefresh",
    };

    (clientProxy.send as jest.Mock).mockReturnValue(of(mockTokens));

    await controller.refreshToken(req as any, res as any);

    expect(clientProxy.send).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith(
      "accessToken",
      "newAccess",
      expect.any(Object),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "newRefresh",
      expect.any(Object),
    );
  });

  it("should throw RpcException if microservice fails", async () => {
    const req = mockRequest();
    const res = mockResponse();

    (clientProxy.send as jest.Mock).mockReturnValue(throwError(() => new Error("smth wrong")));

    await expect(
      controller.login({ email: "fail@gmail.com", password: "wrong" }, req as any, res as any),
    ).rejects.toThrow();
  });
});
