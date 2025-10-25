import { AUTH_PATTERNS, TokensResponse } from "../../../libs/shared/src";
import { AppModule } from "../src/app/app.module";
import { AppService } from "../src/app/app.service";
import { INestMicroservice } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
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
      .overrideProvider(AppService)
      .useValue({
        login: jest.fn().mockResolvedValue(mockTokens),
        register: jest.fn().mockResolvedValue({ accessToken: mockTokens.accessToken }),
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

  afterAll(async () => {
    await app.close();
    await client.close();

    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("LOGIN", async () => {
    const payload = { email: "test@mail.com", password: "123" };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.LOGIN, payload));
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("REGISTER", async () => {
    const payload = { email: "test@mail.com", password: "123", name: "Test" };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.REGISTER, payload));
    expect(result).toHaveProperty("accessToken");
  });

  it("REFRESH TOKEN", async () => {
    const payload = { refreshToken: "some-token" };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.REFRESH_TOKEN, payload));
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("VERIFY EMAIL", async () => {
    const payload = { email: "test@mail.com", code: "12345" };

    const result = await firstValueFrom(client.send(AUTH_PATTERNS.VERIFY_EMAIL, payload));
    expect(result).toHaveProperty("accessToken");
  });

  it("REVOKE REFRESH TOKEN", async () => {
    const payload = { refreshToken: "some-token" };
    await firstValueFrom(client.emit(AUTH_PATTERNS.REVOKE_REFRESH_TOKEN, payload));
  });
});
