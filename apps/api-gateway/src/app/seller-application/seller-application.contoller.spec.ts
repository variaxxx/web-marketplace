import { SellerApplicationController } from "./seller-application.controller";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateSellerApplicationDto, MicroserviceName, SellerApplicationResponse, SellerApplicationStatus, USER_PATTERNS } from "@web-marketplace/shared";
import { of, throwError } from "rxjs";

describe("sellerApplicationController", () => {
  let controller: SellerApplicationController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerApplicationController],
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

    controller = module.get<SellerApplicationController>(SellerApplicationController);
    clientProxy = module.get<ClientProxy>(MicroserviceName.USER_SERVICE);
  });

  const mockRequest = { cookies: { accessToken: "access123" } } as any;
  const sellerApplicationResponse = (name: string, desc: string, status: SellerApplicationStatus): SellerApplicationResponse => ({
    storeName: name,
    storeDescription: desc,
    id: "123",
    createdAt: new Date(),
    status,
    note: null,
    userId: "123",
  });

  it("should create a seller application", async () => {
    const dto: CreateSellerApplicationDto = { storeName: "Name", storeDescription: "Description" };
    const response = sellerApplicationResponse(
      "Name",
      "Description",
      SellerApplicationStatus.PENDING,
    );
    (clientProxy.send as jest.Mock).mockReturnValue(of(response));

    const res = await controller.create(dto, mockRequest);

    expect(res).toEqual(response);
    expect(clientProxy.send).toHaveBeenCalledWith(USER_PATTERNS.SELLER_APPLICATION.CREATE, {
      accessToken: "access123",
      storeName: "Name",
      storeDescription: "Description",
    });
  });

  it("should cancel a seller application", async () => {
    const response = sellerApplicationResponse(
      "Name",
      "Description",
      SellerApplicationStatus.CANCELLED,
    );
    (clientProxy.send as jest.Mock).mockReturnValue(of(response));

    const res = await controller.cancel("123", mockRequest);

    expect(res).toEqual(response);
    expect(clientProxy.send).toHaveBeenCalledWith(USER_PATTERNS.SELLER_APPLICATION.CANCEL, {
      accessToken: "access123",
      applicationId: "123",
    });
  });

  it("should decline a seller application", async () => {
    const response = sellerApplicationResponse(
      "Name",
      "Description",
      SellerApplicationStatus.DECLINED,
    );
    (clientProxy.send as jest.Mock).mockReturnValue(of(response));

    const res = await controller.decline("123", mockRequest);

    expect(res).toEqual(response);
    expect(clientProxy.send).toHaveBeenCalledWith(USER_PATTERNS.SELLER_APPLICATION.DECLINE, {
      accessToken: "access123",
      applicationId: "123",
    });
  });

  it("should approve a seller application", async () => {
    const response = sellerApplicationResponse(
      "Name",
      "Description",
      SellerApplicationStatus.SUCCESS,
    );
    (clientProxy.send as jest.Mock).mockReturnValue(of(response));

    const res = await controller.approve("123", mockRequest);

    expect(res).toEqual(response);
    expect(clientProxy.send).toHaveBeenCalledWith(USER_PATTERNS.SELLER_APPLICATION.APPROVE, {
      accessToken: "access123",
      applicationId: "123",
    });
  });

  it("should find many seller applications", async () => {
    const dto = { count: 10, lastId: "0", status: SellerApplicationStatus.SUCCESS };
    const response = {
      items: [sellerApplicationResponse(
        "name",
        "description",
        SellerApplicationStatus.SUCCESS,
      )],
      total: 1,
      count: 1,
    };
    (clientProxy.send as jest.Mock).mockReturnValue(of(response));

    const res = await controller.findMany(dto, mockRequest);

    expect(res).toEqual(response);
    expect(clientProxy.send).toHaveBeenCalledWith(USER_PATTERNS.SELLER_APPLICATION.FIND_MANY, {
      accessToken: "access123",
      count: 10,
      lastId: "0",
      status: SellerApplicationStatus.SUCCESS,
    });
  });

  it("should find one seller application", async () => {
    const response = sellerApplicationResponse(
      "name",
      "description",
      SellerApplicationStatus.PENDING,
    );
    (clientProxy.send as jest.Mock).mockReturnValue(of(response));

    const res = await controller.findOne("123", mockRequest);

    expect(res).toEqual(response);
    expect(clientProxy.send).toHaveBeenCalledWith(USER_PATTERNS.SELLER_APPLICATION.FIND_ONE, {
      accessToken: "access123",
      applicationId: "123",
    });
  });

  it("should throw RpcException on microservice error", async () => {
    (clientProxy.send as jest.Mock).mockReturnValue(throwError(() => new Error("fail")));

    await expect(controller.create({ storeName: "x", storeDescription: "y" }, mockRequest))
      .rejects
      .toThrow(RpcException);
    await expect(controller.cancel("1", mockRequest))
      .rejects
      .toThrow(RpcException);
    await expect(controller.decline("1", mockRequest))
      .rejects
      .toThrow(RpcException);
    await expect(controller.approve("1", mockRequest))
      .rejects
      .toThrow(RpcException);
    await expect(controller.findMany({ count: 1, lastId: null, status: SellerApplicationStatus.PENDING }, mockRequest))
      .rejects
      .toThrow(RpcException);
    await expect(controller.findOne("1", mockRequest))
      .rejects
      .toThrow(RpcException);
  });
});
