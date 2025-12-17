import { StoreController } from "../src/app/store/store.controller";
import { AllExceptionFilter } from "../src/common/filters/all-exception.filter";
import { RpcExceptionFilter } from "../src/common/filters/rpc.filter";
import { INestApplication } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import {
  MicroserviceName,
  StoreInfoResponse,
  USER_PATTERNS,
} from "@web-marketplace/shared";
import cookieParser from "cookie-parser";
import { Buffer } from "node:buffer";
import { of } from "rxjs";
import request from "supertest";

describe("Store (E2E)", () => {
  let app: INestApplication;
  let clientProxy: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: MicroserviceName.USER_SERVICE,
          useValue: {
            send: jest.fn(),
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

    clientProxy = module.get<ClientProxy>(MicroserviceName.USER_SERVICE);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/store/my (GET)", () => {
    it("should return my store", async () => {
      const mockStore: StoreInfoResponse = {
        id: "store-id",
        name: "My Store",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockStore));

      const res = await request(app.getHttpServer())
        .get("/store/my")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockStore);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.STORE.GET_MY,
        { accessToken: "token123" },
      );
    });
  });

  describe("/store/:id (GET)", () => {
    it("should return store info by owner id", async () => {
      const mockStore: StoreInfoResponse = {
        id: "store-id",
        ownerId: "user-id",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockStore));

      const res = await request(app.getHttpServer())
        .get("/store/user-id")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockStore);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.STORE.GET_INFO,
        {
          accessToken: "token123",
          ownerId: "user-id",
        },
      );
    });
  });

  describe("/store/picture (POST)", () => {
    it("should upload store picture", async () => {
      const mockStore: StoreInfoResponse = {
        id: "store-id",
        pictureUrl: "img.png",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockStore));

      const res = await request(app.getHttpServer())
        .post("/store/picture")
        .set("Cookie", ["accessToken=token123"])
        .attach(
          "image",
          Buffer.from("fake-image"),
          {
            filename: "store.png",
            contentType: "image/png",
          },
        )
        .expect(200);

      expect(res.body).toEqual(mockStore);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.STORE.SET_STORE_PICTURE,
        {
          accessToken: "token123",
          image: expect.any(Buffer),
        },
      );
    });

    it("should fail with unsupported file type", async () => {
      await request(app.getHttpServer())
        .post("/store/picture")
        .set("Cookie", ["accessToken=token123"])
        .attach(
          "image",
          Buffer.from("not-image"),
          {
            filename: "store.txt",
            contentType: "text/plain",
          },
        )
        .expect(400);
    });
  });
});
