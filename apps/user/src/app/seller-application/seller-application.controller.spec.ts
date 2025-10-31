import { SellerApplicationController } from "./seller-application.controller";
import { SellerApplicationService } from "./seller-application.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { ApproveSellerApplicationPayload, AuthTokenPayload, CancelSellerApplicationPayload, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, SellerApplicationResponse, SellerApplicationStatus, UserRole } from "@web-marketplace/shared";

describe("sellerApplicationController", () => {
  let controller: SellerApplicationController;
  let service: SellerApplicationService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerApplicationController],
      providers: [
        {
          provide: SellerApplicationService,
          useValue: {
            create: jest.fn(),
            approve: jest.fn(),
            decline: jest.fn(),
            cancel: jest.fn(),
            findOne: jest.fn(),
            findMany: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SellerApplicationController>(SellerApplicationController);
    service = module.get<SellerApplicationService>(SellerApplicationService);
  });

  const mockApplication: SellerApplicationResponse = {
    id: "1",
    createdAt: new Date(),
    status: SellerApplicationStatus.PENDING,
    storeName: "name",
    storeDescription: "description",
    userId: "123",
    note: null,
  };

  const mockTokenPayload: AuthTokenPayload = {
    userId: "123",
    email: "test@gmail.com",
    role: UserRole.USER,
  };

  describe("create", () => {
    it("should call service and return result", async () => {
      const payload: CreateSellerApplicationPayload = {
        accessToken: "accessToken",
        storeName: "name",
        storeDescription: "description",
      };

      (service.create as jest.Mock).mockResolvedValue(mockApplication);

      const res = await controller.create(payload, mockTokenPayload);

      expect(service.create).toHaveBeenCalledWith(payload, mockTokenPayload);
      expect(res).toEqual(mockApplication);
    });
  });

  describe("approve", () => {
    it("should call service and return result", async () => {
      const payload: ApproveSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };

      (service.approve as jest.Mock).mockResolvedValue(mockApplication);

      const res = await controller.approve(payload);

      expect(service.approve).toHaveBeenCalledWith(payload);
      expect(res).toEqual(mockApplication);
    });
  });

  describe("decline", () => {
    it("should call service and return result", async () => {
      const payload: DeclineSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };

      (service.decline as jest.Mock).mockResolvedValue(mockApplication);

      const res = await controller.decline(payload);

      expect(service.decline).toHaveBeenCalledWith(payload);
      expect(res).toEqual(mockApplication);
    });
  });

  describe("cancel", () => {
    it("should call service and return result", async () => {
      const payload: CancelSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };

      (service.cancel as jest.Mock).mockResolvedValue(mockApplication);

      const res = await controller.cancel(payload, mockTokenPayload);

      expect(service.cancel).toHaveBeenCalledWith(payload, mockTokenPayload);
      expect(res).toEqual(mockApplication);
    });
  });

  describe("findOne", () => {
    it("should call service and return result", async () => {
      const payload: FindOneSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };

      (service.findOne as jest.Mock).mockResolvedValue(mockApplication);

      const res = await controller.findOne(payload, mockTokenPayload);

      expect(service.findOne).toHaveBeenCalledWith(payload, mockTokenPayload);
      expect(res).toEqual(mockApplication);
    });
  });

  describe("findMany", () => {
    it("should call service and return result", async () => {
      const payload: FindManySellerApplicationsPayload = {
        accessToken: "accessToken",
        count: 5,
        lastId: "123",
        status: SellerApplicationStatus.PENDING,
      };

      (service.findMany as jest.Mock).mockResolvedValue({
        total: 1,
        count: 1,
        items: [
          mockApplication,
        ],
      } as FindManyApiResponse<SellerApplicationResponse>);

      const res = await controller.findMany(payload, mockTokenPayload);

      expect(service.findMany).toHaveBeenCalledWith(payload, mockTokenPayload);
      expect(res.items).toContain(mockApplication);
    });
  });
});
