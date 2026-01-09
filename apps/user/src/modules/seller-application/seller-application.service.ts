import { MICROSERVICE_CLIENT_NAMES } from "../../core/config/microservice-client.names";
import { PrismaService } from "../../infra/db/prisma.service";
import { SELLER_APPLICATION_SELECT } from "./seller-application.constants";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Prisma } from "@prisma/generated/userClient";
import { AUTH_RMQ_PATTERN, ChangeUserRolePayload, dateToTimestamp, GRPC_ERROR_CODE, MAIL_RMQ_PATTERN, MicroserviceError, PrismaQueryError, SELLER_APPLICATION_STATUS, SellerApplicationReviewedPayload, sellerApplicationStatusMappings, sortOrderMappings, USER_ROLE } from "@web-marketplace/backend";
import { ApproveSellerApplicationPayload, CancelSellerApplicationPayload, CreateSellerApplicationPayload, FindManySellerApplicationsPayload, FindManySellerApplicationsResponse, FindOneSellerApplicationPayload, RejectSellerApplicationPayload, SellerApplicationInfoResponse } from "@web-marketplace/contracts/gen/seller-application";
import { firstValueFrom } from "rxjs";

@Injectable()
export class SellerApplicationService {
  private toResponse(
    application: Prisma.SellerApplicationGetPayload<{ select: typeof SELLER_APPLICATION_SELECT }>,
    role: string,
  ): SellerApplicationInfoResponse {
    const status = sellerApplicationStatusMappings.toGrpc(application.status);

    if (!status) throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Invalid status");

    return {
      ...application,
      createdAt: dateToTimestamp(application.createdAt),
      decisionMadeAt: application.decisionMadeAt ? dateToTimestamp(application.decisionMadeAt) : undefined,
      status,
      reviewedBy:
        role === USER_ROLE.ADMIN
          ? application.reviewedBy
          : undefined,
    };
  };

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MICROSERVICE_CLIENT_NAMES.AUTH_RMQ) private readonly authClient: ClientProxy,
    @Inject(MICROSERVICE_CLIENT_NAMES.NOTIFICATION_RMQ) private readonly notificationClient: ClientProxy,
  ) {}

  async create(
    payload: CreateSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    if (payload.userInfo.role === USER_ROLE.SELLER)
      throw new MicroserviceError(GRPC_ERROR_CODE.ALREADY_EXISTS, "You are already a seller");

    const candidate = await this.prisma.sellerApplication.findMany({
      where: { userId: payload.userInfo.userId, status: SELLER_APPLICATION_STATUS.PENDING },
    });

    if (candidate.length)
      throw new MicroserviceError(GRPC_ERROR_CODE.ALREADY_EXISTS, "You already have a pending application");

    const application = await this.prisma.sellerApplication.create({
      data: {
        userId: payload.userInfo.userId,
        status: SELLER_APPLICATION_STATUS.PENDING,
        storeName: payload.storeName,
        storeDescription: payload.storeDescription ?? null,
      },
      select: SELLER_APPLICATION_SELECT,
    });

    return this.toResponse(application, payload.userInfo.role);
  }

  async approve(
    payload: ApproveSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.$transaction(async (tx) => {
      const application = await tx.sellerApplication.update({
        where: {
          id: payload.applicationId,
          status: SELLER_APPLICATION_STATUS.PENDING,
        },
        data: {
          status: SELLER_APPLICATION_STATUS.APPROVED,
          reviewedById: payload.userInfo.userId,
          decisionMadeAt: new Date(),
        },
        select: {
          ...SELLER_APPLICATION_SELECT,
          user: { select: { email: true } },
        },
      });

      await tx.store.create({
        data: {
          ownerId: application.userId,
          name: application.storeName,
          description: application.storeDescription,
        },
      });

      return application;
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Application not found");
      if (e.code === PrismaQueryError.UniqueConstraintViolation)
        throw new MicroserviceError(GRPC_ERROR_CODE.ALREADY_EXISTS, "This user already have a store");
      throw e;
    });

    await Promise.all([
      firstValueFrom(this.authClient.emit(AUTH_RMQ_PATTERN.CHANGE_USER_ROLE, {
        userId: application.userId,
        role: USER_ROLE.SELLER,
      } as ChangeUserRolePayload)),
      firstValueFrom(this.notificationClient.emit(MAIL_RMQ_PATTERN.SELLER_APPLICATION_REVIEWED, {
        userEmail: application.user.email,
        applicationId: application.id,
        storeName: application.storeName,
        decisionMadeAt: application.decisionMadeAt,
        rejectionReason: application.rejectionReason,
        isApproved: true,
      } as SellerApplicationReviewedPayload)),
    ]);

    return this.toResponse(application, payload.userInfo.role);
  }

  async cancel(
    payload: CancelSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.sellerApplication.update({
      where: {
        id: payload.applicationId,
        userId: payload.userInfo.userId,
        status: SELLER_APPLICATION_STATUS.PENDING,
      },
      data: {
        status: SELLER_APPLICATION_STATUS.CANCELLED,
      },
      select: SELLER_APPLICATION_SELECT,
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Application not found");
      throw e;
    });

    return this.toResponse(application, payload.userInfo.role);
  }

  async reject(
    payload: RejectSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.sellerApplication.update({
      where: {
        id: payload.applicationId,
        status: SELLER_APPLICATION_STATUS.PENDING,
      },
      data: {
        status: SELLER_APPLICATION_STATUS.REJECTED,
        rejectionReason: payload.rejectionReason,
        decisionMadeAt: new Date(),
        reviewedById: payload.userInfo.userId,
      },
      select: {
        ...SELLER_APPLICATION_SELECT,
        user: { select: { email: true } },
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Application not found");
      throw e;
    });

    await firstValueFrom(this.notificationClient.emit(MAIL_RMQ_PATTERN.SELLER_APPLICATION_REVIEWED, {
      userEmail: application.user.email,
      applicationId: application.id,
      decisionMadeAt: application.decisionMadeAt,
      storeName: application.storeName,
      rejectionReason: application.rejectionReason,
      isApproved: false,
    } as SellerApplicationReviewedPayload));

    return this.toResponse(application, payload.userInfo.role);
  }

  async findOne(
    payload: FindOneSellerApplicationPayload,
  ): Promise<SellerApplicationInfoResponse> {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { id: payload.applicationId },
      select: SELLER_APPLICATION_SELECT,
    });

    if (
      ([USER_ROLE.SELLER, USER_ROLE.USER] as string[]).includes(payload.userInfo.role)
      && ((application && application.userId !== payload.userInfo.userId) || !application)
    ) {
      throw new MicroserviceError(GRPC_ERROR_CODE.PERMISSION_DENIED, "Forbidden");
    }

    if (!application)
      throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Application not found");

    return this.toResponse(application, payload.userInfo.role);
  }

  async findMany(
    payload: FindManySellerApplicationsPayload,
  ): Promise<FindManySellerApplicationsResponse> {
    const orderBy: Prisma.SellerApplicationOrderByWithAggregationInput = {};
    const orderByFields = ["createdAt"];

    const DEFAULT_SORT_FIELD = "createdAt";
    const DEFAULT_SORT_ORDER = "desc";

    if (payload.sortBy) {
      if (!orderByFields.includes(payload.sortBy.field))
        throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, `Invalid sort field: ${payload.sortBy.field}`);

      const order = sortOrderMappings.fromGrpc(payload.sortBy.order);

      if (!order)
        throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Invalid sort order");

      orderBy[payload.sortBy.field] = order;
    } else {
      orderBy[DEFAULT_SORT_FIELD] = DEFAULT_SORT_ORDER;
    }

    const where: Prisma.SellerApplicationWhereInput = {};

    if (payload.status)
      where.status = sellerApplicationStatusMappings.fromGrpc(payload.status);
    if (([USER_ROLE.SELLER, USER_ROLE.USER] as string[]).includes(payload.userInfo.role))
      where.userId = payload.userInfo.userId;

    const [totalCount, applications] = await this.prisma.$transaction([
      this.prisma.sellerApplication.count({
        where,
      }),
      this.prisma.sellerApplication.findMany({
        where,
        skip: payload.offset ? Math.max(payload.limit, 0) : 0,
        take: payload.limit ? Math.min(20, Math.max(payload.limit, 0)) : 20,
        orderBy,
        select: SELLER_APPLICATION_SELECT,
      }),
    ]);

    const formattedApplications = applications.map(app => this.toResponse(app, payload.userInfo.role));

    return {
      total: totalCount,
      count: formattedApplications.length,
      items: formattedApplications,
    };
  }
}
