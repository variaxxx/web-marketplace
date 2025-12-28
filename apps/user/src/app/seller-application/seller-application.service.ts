import { PrismaService } from "../../db/prisma.service";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { ApproveSellerApplicationPayload, AUTH_PATTERNS, BecomeSellerPayload, CancelSellerApplicationPayload, CreateSellerApplicationPayload, DeclineSellerApplicationPayload, FindManyApiResponse, FindManySellerApplicationsPayload, FindOneSellerApplicationPayload, MicroserviceName, SellerApplicationInfoResponse, SellerApplicationStatus, USER_ROLE } from "@web-marketplace/shared";

@Injectable()
export class SellerApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MicroserviceName.AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  async create(
    payload: CreateSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    if (payload.userInfo.role === USER_ROLE.SELLER) {
      throw new RpcException({
        status: 400,
        message: "You are already a seller",
      });
    }

    const candidate = await this.prisma.sellerApplication.findMany({
      where: { userId: payload.userInfo.userId, status: "PENDING" },
    });

    if (candidate.length) {
      throw new RpcException({
        status: 400,
        message: "You already have a pending application",
      });
    }

    const application = await this.prisma.sellerApplication.create({
      data: {
        userId: payload.userInfo.userId,
        status: "PENDING",
        storeName: payload.storeName,
        storeDescription: payload.storeDescription,
      },
    });

    return this.formatDbModel(application);
  }

  async approve(
    payload: ApproveSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.$transaction(async (tx) => {
      const application = await tx.sellerApplication.update({
        where: {
          id: payload.applicationId,
          status: "PENDING",
        },
        data: { status: "SUCCESS" },
      });

      await tx.store.create({
        data: {
          ownerId: application.userId,
          name: application.storeName,
          description: application.storeDescription,
        },
      });

      // TODO: email notification

      return application;
    }).catch((e) => {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 404,
          message: "Application not found",
        });
      }
      if (e.code === "P2002") {
        throw new RpcException({
          status: 400,
          message: "This user already have a store",
        });
      }
      throw e;
    }); ;

    this.authClient.emit(AUTH_PATTERNS.BECOME_SELLER, {
      userId: application.userId,
    } as BecomeSellerPayload);

    return this.formatDbModel(application);
  }

  async cancel(
    payload: CancelSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.sellerApplication.update({
      where: {
        id: payload.applicationId,
        userId: payload.userInfo.userId,
        status: "PENDING",
      },
      data: { status: "CANCELLED" },
    }).catch((e) => {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 404,
          message: "Application not found",
        });
      }
      throw e;
    });

    return this.formatDbModel(application);
  }

  async decline(
    payload: DeclineSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.sellerApplication.update({
      where: {
        id: payload.applicationId,
        status: "PENDING",
      },
      data: {
        status: "DECLINED",
        note: payload.note,
      },
    }).catch((e) => {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 404,
          message: "Application not found",
        });
      }
      throw e;
    });

    // TODO: email notification

    return this.formatDbModel(application);
  }

  async findOne(
    payload: FindOneSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { id: payload.applicationId },
    });

    if (
      ([USER_ROLE.SELLER, USER_ROLE.USER] as string[]).includes(payload.userInfo.role)
      && ((application && application.userId !== payload.userInfo.userId) || !application)
    ) {
      throw new RpcException({
        status: 403,
        message: "Forbidden",
      });
    }

    if (!application) {
      throw new RpcException({
        status: 404,
        message: "Application not found",
      });
    }

    return this.formatDbModel(application);
  }

  async findMany(
    payload: FindManySellerApplicationsPayload,
  ): Promise<FindManyApiResponse<SellerApplicationInfoResponse>> {
    const where: any = {};

    if (payload.status)
      where.status = payload.status;
    if (([USER_ROLE.SELLER, USER_ROLE.USER] as string[]).includes(payload.userInfo.role))
      where.userId = payload.userInfo.userId;

    const [totalCount, applications] = await this.prisma.$transaction([
      this.prisma.sellerApplication.count({
        where,
      }),
      this.prisma.sellerApplication.findMany({
        where,
        cursor: payload.lastId ? { id: payload.lastId } : undefined,
        take: payload.count ?? 30,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedApplications = applications.map(app => this.formatDbModel(app));

    return {
      total: totalCount,
      count: formattedApplications.length,
      items: formattedApplications,
    };
  }

  private formatDbModel(
    application: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      status: string;
      note: string | null;
      storeName: string;
      storeDescription: string;
    },
  ): SellerApplicationInfoResponse {
    return {
      id: application.id,
      createdAt: application.createdAt,
      status: application.status as SellerApplicationStatus,
      storeDescription: application.storeDescription,
      storeName: application.storeName,
      userId: application.userId,
      note: application.note,
    };
  };
}
