import { AppModule } from "../src/app/app.module";
import { AuthService } from "../src/app/auth/auth.service";
import { INestMicroservice } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { AUTH_PATTERNS, Device, LoginPayload, RefreshTokenPayload, RegistrationPayload, RevokeRefreshTokenPayload, TokensResponse, VerifyEmailPayload } from "@web-marketplace/shared";
import { firstValueFrom } from "rxjs";

const mockTokens: TokensResponse = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

describe("Auth Microservice (E2E)", () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({
        login: jest.fn().mockResolvedValue(mockTokens),
        registration: jest.fn().mockResolvedValue({ accessToken: mockTokens.accessToken }),
        refreshToken: jest.fn().mockResolvedValue(mockTokens),
        verifyEmail: jest.fn().mockResolvedValue(mockTokens),
        revokeRefreshToken: jest.fn(),
      })
      .compile();

    app = module.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: {
        port: 4001,
      },
    });

    await app.listen();

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { port: 4001 },
    });

    await client.connect();
  });

  const mockDevice: Device = {
    browserName: "Mozilla",
  };

  afterAll(async () => {
    await app.close();
    await client.close();

    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("LOGIN", async () => {
    const payload: LoginPayload = { email: "test@mail.com", password: "123", device: mockDevice };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.LOGIN, payload));
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("REGISTRATION", async () => {
    const payload: RegistrationPayload = { email: "test@mail.com", password: "123" };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.REGISTRATION, payload));
    expect(result).toHaveProperty("accessToken");
  });

  it("REFRESH TOKEN", async () => {
    const payload: RefreshTokenPayload = { refreshToken: "some-token", device: mockDevice };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.REFRESH_TOKEN, payload));
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("VERIFY EMAIL", async () => {
    const payload: VerifyEmailPayload = { token: "some-token", device: mockDevice };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.VERIFY_EMAIL, payload));
    expect(result).toHaveProperty("accessToken");
  });

  it("REVOKE REFRESH TOKEN", async () => {
    const payload: RevokeRefreshTokenPayload = { refreshToken: "some-token" };
    await firstValueFrom(client.emit(AUTH_PATTERNS.REVOKE_REFRESH_TOKEN, payload));
  });
});
