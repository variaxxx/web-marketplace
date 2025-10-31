import { PrismaService } from "../../db/prisma.service";
import { SellerApplicationService } from "./seller-application.service";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { ApproveSellerApplicationPayload, AUTH_PATTERNS, AuthTokenPayload, CancelSellerApplicationPayload, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, MicroserviceName, SellerApplicationResponse, SellerApplicationStatus, UserRole } from "@web-marketplace/shared";

describe("sellerApplicationService", () => {
  let service: SellerApplicationService;
  let prisma: PrismaService;
  let authClient: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerApplicationService,
        {
          provide: PrismaService,
          useValue: {
            sellerApplication: {
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: MicroserviceName.AUTH_SERVICE,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SellerApplicationService>(SellerApplicationService);
    prisma = module.get<PrismaService>(PrismaService);
    authClient = module.get<ClientProxy>(MicroserviceName.AUTH_SERVICE);
  });

  const mockTokenPayload = (role: UserRole): AuthTokenPayload => ({
    userId: "123",
    email: "test@gmail.com",
    role,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const date = new Date();
  const mockApplication = {
    id: "1",
    status: "PENDING",
    createdAt: date,
    updatedAt: date,
    userId: "123",
    note: null,
    storeName: "name",
    storeDescription: "desc",
  };
  const mockApplicationResponse: SellerApplicationResponse = {
    id: mockApplication.id,
    status: mockApplication.status as SellerApplicationStatus,
    createdAt: mockApplication.createdAt,
    userId: mockApplication.userId,
    note: mockApplication.note,
    storeName: mockApplication.storeName,
    storeDescription: mockApplication.storeDescription,
  };

  describe("create", () => {
    it("should create application and return result", async () => {
      (prisma.sellerApplication.create as jest.Mock).mockResolvedValue(
        mockApplication,
      );
      (prisma.sellerApplication.findMany as jest.Mock).mockResolvedValue([]);

      const payload: CreateSellerApplicationPayload = {
        accessToken: "accessToken",
        storeName: "name",
        storeDescription: "desc",
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      const res = await service.create(payload, tokenPayload);

      expect(res).toEqual(mockApplicationResponse);
      expect(prisma.sellerApplication.create).toHaveBeenCalled();
      expect(prisma.sellerApplication.findMany).toHaveBeenCalledWith({
        where: { userId: "123", status: "PENDING" },
      });
    });

    it("should throw RpcException if seller is trying to create", async () => {
      const payload: CreateSellerApplicationPayload = {
        accessToken: "accessToken",
        storeName: "name",
        storeDescription: "desc",
      };
      const tokenPayload = mockTokenPayload(UserRole.SELLER);

      await expect(service.create(payload, tokenPayload)).rejects.toThrow(RpcException);
    });

    it("should throw RpcException if pending application found", async () => {
      const payload: CreateSellerApplicationPayload = {
        accessToken: "accessToken",
        storeName: "name",
        storeDescription: "desc",
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      (prisma.sellerApplication.findMany as jest.Mock).mockResolvedValue([
        mockApplication,
      ]);

      await expect(service.create(payload, tokenPayload)).rejects.toThrow(RpcException);
    });
  });

  describe("approve", () => {
    it("should approve application, emit notification and return result", async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue({ ...mockApplication, status: SellerApplicationStatus.SUCCESS });

      const payload: ApproveSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };

      const res = await service.approve(payload);

      expect(res.status).toBe(SellerApplicationStatus.SUCCESS);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(authClient.emit).toHaveBeenCalledWith(
        AUTH_PATTERNS.BECOME_SELLER,
        { userId: "123" },
      );
      // expect() // TODO: notification test
    });

    it("should throw RpcException if application not found", async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue({ code: "P2025" });

      const payload: ApproveSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };

      await expect(service.approve(payload)).rejects.toThrow(RpcException);
    });

    it("should throw RpcException if user already have a store", async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue({ code: "P2002" });

      const payload: ApproveSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };

      await expect(service.approve(payload)).rejects.toThrow(RpcException);
    });
  });

  describe("cancel", () => {
    it("should update application status and return result", async () => {
      const payload: CancelSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      (prisma.sellerApplication.update as jest.Mock).mockResolvedValue({ ...mockApplication, status: SellerApplicationStatus.CANCELLED });

      const res = await service.cancel(payload, tokenPayload);

      expect(res.status).toBe(SellerApplicationStatus.CANCELLED);
      expect(prisma.sellerApplication.update).toHaveBeenCalled();
    });

    it("should throw RpcException if user don`t have this application", async () => {
      const payload: CancelSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      (prisma.sellerApplication.update as jest.Mock).mockRejectedValue({ code: "P2025" });

      await expect(service.cancel(payload, tokenPayload)).rejects.toThrow(RpcException);
    });
  });

  describe("decline", () => {
    it("should decline application and return result", async () => {
      const payload: DeclineSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
        note: "declined",
      };

      (prisma.sellerApplication.update as jest.Mock).mockResolvedValue({
        ...mockApplication,
        status: SellerApplicationStatus.DECLINED,
        note: payload.note,
      });

      const res = await service.decline(payload);

      expect(res.status).toBe(SellerApplicationStatus.DECLINED);
      expect(res.note).toBe(payload.note);
      expect(prisma.sellerApplication.update).toHaveBeenCalled();
      // TODO: test notification sent
    });

    it("should throw RpcException if application not found", async () => {
      const payload: DeclineSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
        note: "declined",
      };

      (prisma.sellerApplication.update as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      await expect(service.decline(payload)).rejects.toThrow(RpcException);
    });
  });

  describe("findOne", () => {
    it("should return found application", async () => {
      const payload: FindOneSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      (prisma.sellerApplication.findUnique as jest.Mock).mockResolvedValue(mockApplication);

      const res = await service.findOne(payload, tokenPayload);

      expect(prisma.sellerApplication.findUnique).toHaveBeenCalled();
      expect(res).toEqual(mockApplicationResponse);
    });

    it("should throw RpcException if application not found", async () => {
      const payload: FindOneSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      (prisma.sellerApplication.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(payload, tokenPayload)).rejects.toThrow(RpcException);
    });

    it("should throw RpcException if user is not owner", async () => {
      (prisma.sellerApplication.findUnique as jest.Mock).mockResolvedValue({
        ...mockApplication,
        userId: "999",
      });

      const payload: FindOneSellerApplicationPayload = {
        accessToken: "accessToken",
        applicationId: "1",
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      await expect(service.findOne(payload, tokenPayload)).rejects.toThrow(RpcException);
    });
  });

  describe("findMany", () => {
    it("should return list of applications", async () => {
      const payload: FindManySellerApplicationsPayload = {
        accessToken: "accessToken",
        count: 1,
        lastId: "0",
        status: SellerApplicationStatus.PENDING,
      };
      const tokenPayload = mockTokenPayload(UserRole.USER);

      (prisma.$transaction as jest.Mock).mockResolvedValue([
        1,
        [mockApplication],
      ]);

      const res = await service.findMany(payload, tokenPayload);

      expect(res.total).toBe(1);
      expect(res.count).toBe(1);
      expect(res.items[0].id).toBe("1");
    });
  });
});
