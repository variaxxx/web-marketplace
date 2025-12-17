import { SellerApplicationController } from "../src/app/seller-application/seller-application.controller";
import { AllExceptionFilter } from "../src/common/filters/all-exception.filter";
import { RpcExceptionFilter } from "../src/common/filters/rpc.filter";
import { INestApplication } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import {
  CreateSellerApplicationDto,
  FindManyApiResponse,
  MicroserviceName,
  SellerApplicationResponse,
  USER_PATTERNS,
} from "@web-marketplace/shared";
import cookieParser from "cookie-parser";
import { of } from "rxjs";
import request from "supertest";

describe("SellerApplication (E2E)", () => {
  let app: INestApplication;
  let clientProxy: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerApplicationController],
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

  describe("/sellerApplication (POST)", () => {
    it("should create seller application", async () => {
      const mockResponse: SellerApplicationResponse = {
        id: "app-id",
        storeName: "My Store",
        status: "PENDING",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockResponse));

      const res = await request(app.getHttpServer())
        .post("/sellerApplication")
        .set("Cookie", ["accessToken=token123"])
        .send({
          storeName: "My Store",
          storeDescription: "Cool store",
        } as CreateSellerApplicationDto)
        .expect(201);

      expect(res.body).toEqual(mockResponse);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.SELLER_APPLICATION.CREATE,
        {
          accessToken: "token123",
          storeName: "My Store",
          storeDescription: "Cool store",
        },
      );
    });
  });

  describe("/sellerApplication/:id/cancel (POST)", () => {
    it("should cancel application", async () => {
      const mockResponse: SellerApplicationResponse = {
        id: "app-id",
        status: "CANCELED",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockResponse));

      const res = await request(app.getHttpServer())
        .post("/sellerApplication/app-id/cancel")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockResponse);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.SELLER_APPLICATION.CANCEL,
        {
          accessToken: "token123",
          applicationId: "app-id",
        },
      );
    });
  });

  describe("/sellerApplication/:id/decline (POST)", () => {
    it("should decline application", async () => {
      const mockResponse: SellerApplicationResponse = {
        id: "app-id",
        status: "DECLINED",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockResponse));

      const res = await request(app.getHttpServer())
        .post("/sellerApplication/app-id/decline")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockResponse);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.SELLER_APPLICATION.DECLINE,
        {
          accessToken: "token123",
          applicationId: "app-id",
        },
      );
    });
  });

  describe("/sellerApplication/:id/approve (POST)", () => {
    it("should approve application", async () => {
      const mockResponse: SellerApplicationResponse = {
        id: "app-id",
        status: "APPROVED",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockResponse));

      const res = await request(app.getHttpServer())
        .post("/sellerApplication/app-id/approve")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockResponse);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.SELLER_APPLICATION.APPROVE,
        {
          accessToken: "token123",
          applicationId: "app-id",
        },
      );
    });
  });

  describe("/sellerApplication/findMany (GET)", () => {
    it("should return list of applications", async () => {
      const mockResponse: FindManyApiResponse<SellerApplicationResponse> = {
        items: [
          { id: "1", status: "PENDING" },
          { id: "2", status: "APPROVED" },
        ],
        count: 2,
        total: 10,
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockResponse));

      const res = await request(app.getHttpServer())
        .get("/sellerApplication/findMany")
        .set("Cookie", ["accessToken=token123"])
        .send({ count: 10 })
        .expect(200);

      expect(res.body).toEqual(mockResponse);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.SELLER_APPLICATION.FIND_MANY,
        {
          accessToken: "token123",
          count: 10,
          lastId: undefined,
          status: undefined,
        },
      );
    });
  });

  describe("/sellerApplication/:id (GET)", () => {
    it("should return one application", async () => {
      const mockResponse: SellerApplicationResponse = {
        id: "app-id",
        status: "PENDING",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockResponse));

      const res = await request(app.getHttpServer())
        .get("/sellerApplication/app-id")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockResponse);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.SELLER_APPLICATION.FIND_ONE,
        {
          accessToken: "token123",
          applicationId: "app-id",
        },
      );
    });
  });
});
