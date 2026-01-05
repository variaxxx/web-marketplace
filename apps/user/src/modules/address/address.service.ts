import { PrismaService } from "../../infra/db/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/generated/userClient";
import { dateToTimestamp, GRPC_ERROR_CODE, MicroserviceError, PrismaQueryError, USER_ROLE } from "@web-marketplace/backend";
import { AddAddressPayload, AddressInfoResponse, DeleteAddressPayload, EditAddressPayload, FindManyAddressesPayload, FindManyAddressesResponse, FindOneAddressPayload } from "@web-marketplace/contracts/gen/address";

const addressSelect = {
  id: true,
  createdAt: true,
  city: true,
  street: true,
  house: true,
  latitude: true,
  longitude: true,
  label: true,
};

@Injectable()
export class AddressService {
  private toResponse(
    address: Prisma.AddressGetPayload<{ select: typeof addressSelect }>,
  ): AddressInfoResponse {
    return {
      ...address,
      createdAt: dateToTimestamp(address.createdAt),
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    };
  };

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async add(
    payload: AddAddressPayload,
  ): Promise<AddressInfoResponse> {
    const address = await this.prisma.address.create({
      data: {
        userId: payload.userInfo.userId,
        city: payload.city,
        street: payload.street,
        house: payload.house,
        latitude: payload.latitude,
        longitude: payload.longitude,
        label: payload.label,
      },
      select: addressSelect,
    });

    return this.toResponse(address);
  }

  async edit(
    payload: EditAddressPayload,
  ): Promise<AddressInfoResponse> {
    const address = await this.prisma.address.update({
      where: {
        id: payload.addressId,
        userId: payload.userInfo.userId,
        isDeleted: false,
      },
      data: {
        userId: payload.userInfo.userId,
        city: payload.city,
        street: payload.street,
        house: payload.house,
        latitude: payload.latitude,
        longitude: payload.longitude,
        label: payload.label,
      },
      select: addressSelect,
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Address not found");
      throw e;
    });

    return this.toResponse(address);
  }

  async delete(
    payload: DeleteAddressPayload,
  ): Promise<AddressInfoResponse> {
    const address = await this.prisma.address.update({
      where: {
        id: payload.addressId,
        userId: payload.userInfo.userId,
        isDeleted: false,
      },
      data: { isDeleted: true },
      select: addressSelect,
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound)
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Address not found");
      throw e;
    });

    return this.toResponse(address);
  }

  async findOne(
    payload: FindOneAddressPayload,
  ): Promise<AddressInfoResponse> {
    const address = await this.prisma.address.findUnique({
      where: { id: payload.addressId },
      select: {
        ...addressSelect,
        userId: true,
        isDeleted: true,
      },
    });

    if (
      !address
      || (
        payload.userInfo.role !== USER_ROLE.ADMIN
        && (payload.userInfo.userId !== address.userId || address.isDeleted))) {
      throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "Address not found");
    }

    return this.toResponse(address);
  }

  async findMany(
    payload: FindManyAddressesPayload,
  ): Promise<FindManyAddressesResponse> {
    const where: any = {
      userId: payload.userInfo.userId,
      isDeleted: false,
    };

    const [totalCount, addresses] = await this.prisma.$transaction([
      this.prisma.address.count({ where }),
      this.prisma.address.findMany({
        where,
        select: addressSelect,
        skip: payload.offset ? Math.max(payload.limit, 0) : 0,
        take: payload.limit ? Math.min(20, Math.max(payload.limit, 0)) : 20,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedAddresses = addresses.map(address => this.toResponse(address));

    return {
      total: totalCount,
      count: formattedAddresses.length,
      items: formattedAddresses,
    };
  }
}
