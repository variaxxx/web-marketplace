import { AUTH_PATTERNS, LoginDto, MicroserviceName, RegistrationDto, TokenResponse, TokensResponse, VerifyEmailDto } from "../../../libs/shared/src";
import { AuthController } from "../src/app/auth/auth.controller";
import { AllExceptionFilter } from "../src/common/filters/all-exception.filter";
import { RpcExceptionFilter } from "../src/common/filters/rpc.filter";
import { INestApplication } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import { of } from "rxjs";
import request from "supertest";

describe("authController (E2E)", () => {
  let app: INestApplication;
  let clientProxy: ClientProxy;

  beforeAll(async () => {
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

    app = module.createNestApplication();
    app.useGlobalFilters(
      new AllExceptionFilter(),
      new RpcExceptionFilter(),
    );
    app.use(cookieParser());
    await app.init();

    clientProxy = module.get<ClientProxy>(MicroserviceName.AUTH_SERVICE);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/auth/login (POST)", () => {
    it("should return tokens in cookies", async () => {
      const mockTokens: TokensResponse = {
        accessToken: "access123",
        refreshToken: "refresh123",
      };

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockTokens));

      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "test@gmail.com", password: "123123" } as LoginDto)
        .expect(200);

      const cookies = res.headers["set-cookie"];
      const cookiesArray: string[] = Array.isArray(cookies) ? cookies : [cookies];

      expect(cookies).toBeDefined();
      expect(cookiesArray.some(cookie => cookie.includes("accessToken"))).toBe(true);
      expect(cookiesArray.some(cookie => cookie.includes("refreshToken"))).toBe(true);
    });
  });

  describe("/auth/register (POST)", () => {
    it("should return access token in cookies", async () => {
      const mockToken: TokenResponse = {
        accessToken: "access123",
      };

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockToken));

      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "test@gmail.com", name: "Tester", password: "123123" } as RegistrationDto)
        .expect(201);

      const cookies = res.headers["set-cookie"];
      const cookiesArray: string[] = Array.isArray(cookies) ? cookies : [cookies];

      expect(cookies).toBeDefined();
      expect(cookiesArray.some(cookie => cookie.includes("accessToken"))).toBe(true);
    });
  });

  describe("/auth/refreshToken (POST)", () => {
    it("should return tokens in cookies", async () => {
      const mockTokens: TokensResponse = {
        accessToken: "access123",
        refreshToken: "refresh123",
      };

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockTokens));

      const res = await request(app.getHttpServer())
        .post("/auth/refreshToken")
        .set("Cookie", ["refreshToken=oldRefresh"])
        .expect(200);

      const cookies = res.headers["set-cookie"];
      const cookiesArray: string[] = Array.isArray(cookies) ? cookies : [cookies];

      expect(cookies).toBeDefined();
      expect(cookiesArray.some(cookie => cookie.includes("accessToken"))).toBe(true);
      expect(cookiesArray.some(cookie => cookie.includes("refreshToken"))).toBe(true);
    });

    it ("should fail without cookie", async () => {
      await request(app.getHttpServer())
        .post("/auth/refreshToken")
        .expect(400);
    });
  });

  describe("/auth/verifyEmail (POST)", () => {
    it("should return tokens in cookies", async () => {
      const mockTokens: TokensResponse = {
        accessToken: "access123",
        refreshToken: "refresh123",
      };

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockTokens));

      const res = await request(app.getHttpServer())
        .post("/auth/verifyEmail")
        .send({ token: "verificationToken" } as VerifyEmailDto)
        .expect(200);

      const cookies = res.headers["set-cookie"];
      const cookiesArray: string[] = Array.isArray(cookies) ? cookies : [cookies];

      expect(cookies).toBeDefined();
      expect(cookiesArray.some(cookie => cookie.includes("accessToken"))).toBe(true);
      expect(cookiesArray.some(cookie => cookie.includes("refreshToken"))).toBe(true);
    });
  });

  describe("/auth/revokeRefreshToken (POST)", () => {
    it("should emit event to auth service", async () => {
      (clientProxy.emit as jest.Mock).mockReturnValue(of(true));

      await request(app.getHttpServer())
        .post("/auth/revokeRefreshToken")
        .set("Cookie", ["refreshToken=refresh123"])
        .expect(200);

      expect(clientProxy.emit).toHaveBeenCalledWith(
        AUTH_PATTERNS.REVOKE_REFRESH_TOKEN,
        { refreshToken: "refresh123" },
      );
    });

    it ("should fail without cookie", async () => {
      await request(app.getHttpServer())
        .post("/auth/revokeRefreshToken")
        .expect(400);
    });
  });
});
