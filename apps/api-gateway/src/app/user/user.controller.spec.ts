import { AddressResponse, FindManyApiResponse, MicroserviceName, USER_PATTERNS, UserInfoResponse } from "../../../../../libs/shared/src";
import { UserController } from "./user.controller";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { Buffer } from "node:buffer";
import { of, throwError } from "rxjs";

describe("userController", () => {
  let controller: UserController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
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

    controller = module.get<UserController>(UserController);
    clientProxy = module.get<ClientProxy>(MicroserviceName.USER_SERVICE);
  });

  const mockRequest = { cookies: { accessToken: "access123" } } as any;
  const mockUserResponse: UserInfoResponse = {
    name: "name",
    avatarUrl: "assets/123123.png",
    phone: "71231231122",
  };
  const mockAddressResponse: AddressResponse = {
    id: "123",
    city: "moscow",
    house: "123",
    createdAt: new Date(),
    street: "pushkina",
    latitude: 1,
    longitude: 2,
  };

  describe("editInfo", () => {
    it("should edit user info", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUserResponse));

      const dto = { name: "Bob", phone: "123" };

      const result = await controller.editInfo(mockRequest, dto as any);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.EDIT_INFO,
        {
          accessToken: mockRequest.cookies.accessToken,
          name: dto.name,
          phone: dto.phone,
        },
      );
      expect(result).toEqual(mockUserResponse);
    });

    it("should throw RpcException on error", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(
        throwError(() => new Error("fail")),
      );

      await expect(
        controller.editInfo(mockRequest, {} as any),
      ).rejects.toBeInstanceOf(RpcException);
    });
  });

  describe("getMe", () => {
    it("should return current user", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUserResponse));

      const result = await controller.getMe(mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.GET_ME,
        { accessToken: mockRequest.cookies.accessToken },
      );
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe("setPfp", () => {
    it("should set profile picture", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUserResponse));

      const file = {
        buffer: Buffer.from("img"),
      } as Express.Multer.File;

      const result = await controller.setPfp(file, mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.SET_PROFILE_PICTURE,
        {
          accessToken: mockRequest.cookies.accessToken,
          image: file.buffer,
        },
      );
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe("addAddress", () => {
    it("should add address", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddressResponse));

      const result = await controller.addAddress(mockAddressResponse, mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.ADD,
        {
          accessToken: mockRequest.cookies.accessToken,
          ...mockAddressResponse,
        },
      );
      expect(result).toEqual(mockAddressResponse);
    });
  });

  describe("editAddress", () => {
    it("should edit address", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddressResponse));

      const dto = { city: "SPB" };

      const result = await controller.editAddress(
        "addr-id",
        dto as any,
        mockRequest,
      );

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.EDIT,
        {
          accessToken: mockRequest.cookies.accessToken,
          addressId: "addr-id",
          city: dto.city,
        },
      );
      expect(result).toEqual(mockAddressResponse);
    });
  });

  describe("deleteAddress", () => {
    it("should delete address", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddressResponse));

      const result = await controller.deleteAddress("addr-id", mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.DELETE,
        {
          accessToken: mockRequest.cookies.accessToken,
          addressId: "addr-id",
        },
      );
      expect(result).toEqual(mockAddressResponse);
    });
  });

  describe("findAddress", () => {
    it("should find one address", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockAddressResponse));

      const result = await controller.findAddress("addr-id", mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.FIND_ONE,
        {
          accessToken: mockRequest.cookies.accessToken,
          addressId: "addr-id",
        },
      );
      expect(result).toEqual(mockAddressResponse);
    });
  });

  describe("findManyAddresses", () => {
    it("should find many addresses", async () => {
      const mockRes = {
        total: 123,
        count: 10,
        items: [mockAddressResponse],
      } as FindManyApiResponse;

      (clientProxy.send as jest.Mock).mockReturnValue(of(mockRes));

      const dto = { limit: 10 };

      const result = await controller.findManyAddresses(dto as any, mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.ADDRESS.FIND_MANY,
        {
          accessToken: mockRequest.cookies.accessToken,
          limit: 10,
        },
      );
      expect(result).toEqual(mockRes);
    });
  });

  describe("getInfo", () => {
    it("should get user info by id", async () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(mockUserResponse));

      const result = await controller.getInfo("user-id", mockRequest);

      expect(clientProxy.send).toHaveBeenCalledWith(
        USER_PATTERNS.USER.GET_INFO,
        {
          accessToken: mockRequest.cookies.accessToken,
          userId: "user-id",
        },
      );
      expect(result).toEqual(mockUserResponse);
    });
  });
});
