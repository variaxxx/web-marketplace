import { UserController } from "../src/app/user/user.controller";
import { AllExceptionFilter } from "../src/common/filters/all-exception.filter";
import { RpcExceptionFilter } from "../src/common/filters/rpc.filter";
import { INestApplication } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import {
  AddressResponse,
  FindManyApiResponse,
  MicroserviceName,
  USER_PATTERNS,
  UserInfoResponse,
} from "@web-marketplace/shared";
import cookieParser from "cookie-parser";
import { Buffer } from "node:buffer";
import { of } from "rxjs";
import request from "supertest";

describe("User (E2E)", () => {
  let app: INestApplication;
  let clientProxy: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
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

  describe("/user/me (GET)", () => {
    it("should return current user", async () => {
      const mockUser: UserInfoResponse = {
        id: "user-id",
        name: "John",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUser));

      const res = await request(app.getHttpServer())
        .get("/user/me")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.GET_ME,
        { accessToken: "token123" },
      );
    });
  });

  describe("/user/me (PATCH)", () => {
    it("should edit user info", async () => {
      const mockUser: UserInfoResponse = {
        id: "user-id",
        name: "Bob",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUser));

      const res = await request(app.getHttpServer())
        .patch("/user/me")
        .set("Cookie", ["accessToken=token123"])
        .send({ name: "Bob", phone: "123" })
        .expect(200);

      expect(res.body).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.EDIT_INFO,
        {
          accessToken: "token123",
          name: "Bob",
          phone: "123",
        },
      );
    });
  });

  describe("/user/pfp (POST)", () => {
    it("should upload profile picture", async () => {
      const mockUser: UserInfoResponse = {
        id: "user-id",
        avatarUrl: "img.png",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUser));

      const res = await request(app.getHttpServer())
        .post("/user/pfp")
        .set("Cookie", ["accessToken=token123"])
        .attach(
          "image",
          Buffer.from("fake-image"),
          {
            filename: "avatar.png",
            contentType: "image/png",
          },
        )
        .expect(200);

      expect(res.body).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.SET_PROFILE_PICTURE,
        {
          accessToken: "token123",
          image: expect.any(Buffer),
        },
      );
    });

    it("should fail with unsupported file type", async () => {
      await request(app.getHttpServer())
        .post("/user/pfp")
        .set("Cookie", ["accessToken=token123"])
        .attach(
          "image",
          Buffer.from("nope"),
          {
            filename: "avatar.txt",
            contentType: "text/plain",
          },
        )
        .expect(400);
    });
  });

  describe("/user/address (POST)", () => {
    it("should add address", async () => {
      const mockAddress: AddressResponse = {
        id: "addr-id",
        city: "Moscow",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddress));

      const res = await request(app.getHttpServer())
        .post("/user/address")
        .set("Cookie", ["accessToken=token123"])
        .send({ city: "Moscow" })
        .expect(201);

      expect(res.body).toEqual(mockAddress);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.ADD,
        {
          accessToken: "token123",
          city: "Moscow",
        },
      );
    });
  });

  describe("/user/address/:id (PATCH)", () => {
    it("should edit address", async () => {
      const mockAddress: AddressResponse = {
        id: "addr-id",
        city: "SPB",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddress));

      const res = await request(app.getHttpServer())
        .patch("/user/address/addr-id")
        .set("Cookie", ["accessToken=token123"])
        .send({ city: "SPB" })
        .expect(200);

      expect(res.body).toEqual(mockAddress);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.EDIT,
        {
          accessToken: "token123",
          addressId: "addr-id",
          city: "SPB",
        },
      );
    });
  });

  describe("/user/address/:id (DELETE)", () => {
    it("should delete address", async () => {
      const mockAddress: AddressResponse = {
        id: "addr-id",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddress));

      const res = await request(app.getHttpServer())
        .delete("/user/address/addr-id")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockAddress);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.DELETE,
        {
          accessToken: "token123",
          addressId: "addr-id",
        },
      );
    });
  });

  describe("/user/address/:id (GET)", () => {
    it("should get address", async () => {
      const mockAddress: AddressResponse = {
        id: "addr-id",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddress));

      const res = await request(app.getHttpServer())
        .get("/user/address/addr-id")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockAddress);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.FIND_ONE,
        {
          accessToken: "token123",
          addressId: "addr-id",
        },
      );
    });
  });

  describe("/user/addresses (GET)", () => {
    it("should return many addresses", async () => {
      const mockResponse: FindManyApiResponse<AddressResponse> = {
        items: [{ id: "1" }, { id: "2" }],
        count: 2,
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockResponse));

      const res = await request(app.getHttpServer())
        .get("/user/addresses")
        .set("Cookie", ["accessToken=token123"])
        .send({ count: 10 })
        .expect(200);

      expect(res.body).toEqual(mockResponse);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.FIND_MANY,
        {
          accessToken: "token123",
          count: 10,
        },
      );
    });
  });

  describe("/user/:id (GET)", () => {
    it("should get user info by id", async () => {
      const mockUser: UserInfoResponse = {
        id: "user-id",
      } as any;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUser));

      const res = await request(app.getHttpServer())
        .get("/user/user-id")
        .set("Cookie", ["accessToken=token123"])
        .expect(200);

      expect(res.body).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.GET_INFO,
        {
          accessToken: "token123",
          userId: "user-id",
        },
      );
    });
  });
});
