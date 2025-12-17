import { StoreController } from "./store.controller";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { MicroserviceName, StoreInfoResponse, USER_PATTERNS } from "@web-marketplace/shared";
import { Buffer } from "node:buffer";
import { of, throwError } from "rxjs";

describe("storeController", () => {
  let controller: StoreController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: MicroserviceName.USER_SERVICE,
          useValue: {
            send: jest.fn(),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
    clientProxy = module.get<ClientProxy>(MicroserviceName.USER_SERVICE);
  });

  const mockRequest = { cookies: { accessToken: "access123" } } as any;
  const mockStoreResponse: StoreInfoResponse = {
    id: "123",
    name: "store",
    description: "desc",
    avatarUrl: "assets/123123.png",
  };

  describe("getMyStore", () => {
    it("should return store info", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockStoreResponse));

      const res = await controller.getMyStore(mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.STORE.GET_MY,
        { accessToken: mockRequest.cookies.accessToken },
      );
      expect(res).toEqual(mockStoreResponse);
    });

    it("should throw RpcException on error", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(
        throwError(() => new Error("boom")),
      );

      await expect(controller.getMyStore(mockRequest)).rejects.toBeInstanceOf(
        RpcException,
      );
    });
  });

  describe("getInfo", () => {
    it("should return store info", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockStoreResponse));

      const res = await controller.getInfo(mockStoreResponse.id, mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.STORE.GET_INFO,
        {
          accessToken: mockRequest.cookies.accessToken,
          ownerId: mockStoreResponse.id,
        },
      );
      expect(res).toEqual(mockStoreResponse);
    });

    it("should throw RpcException on error", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(
        throwError(() => new Error("boom")),
      );

      await expect(controller.getInfo(
        mockStoreResponse.id,
        mockRequest,
      )).rejects.toBeInstanceOf(
        RpcException,
      );
    });
  });

  describe("setPfp", () => {
    it("should set store picture", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockStoreResponse));

      const mockFile = {
        buffer: Buffer.from("image"),
      } as Express.Multer.File;

      const result = await controller.setPfp(mockFile, mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.STORE.SET_STORE_PICTURE,
        {
          accessToken: mockRequest.cookies.accessToken,
          image: mockFile.buffer,
        },
      );
      expect(result).toEqual(mockStoreResponse);
    });

    it("should throw RpcException on error", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(
        throwError(() => new Error("image bad")),
      );

      const mockFile = {
        buffer: Buffer.from("image"),
      } as Express.Multer.File;

      await expect(
        controller.setPfp(mockFile, mockRequest),
      ).rejects.toBeInstanceOf(RpcException);
    });
  });
});
