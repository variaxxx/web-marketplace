import { PrismaService } from "../../db/prisma.service";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { AddAddressPayload, AddressResponse, AuthTokenPayload, DeleteAddressPayload, EditAddressPayload, FindManyAddressesPayload, FindManyApiResponse, FindOneAddressPayload, UserRole } from "@web-marketplace/shared";

@Injectable()
export class AddressService {
  private readonly addressSelect = {
    id: true,
    createdAt: true,
    city: true,
    street: true,
    house: true,
    latitude: true,
    longitude: true,
    label: true,
  };

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async add(
    payload: AddAddressPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    const address = await this.prisma.address.create({
      data: {
        userId: jwtPayload.userId,
        city: payload.city,
        street: payload.street,
        house: payload.house,
        latitude: payload.latitude,
        longitude: payload.longitude,
        label: payload.label,
      },
      select: this.addressSelect,
    });

    return {
      ...address,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    };
  }

  async edit(
    payload: EditAddressPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    const address = await this.prisma.address.update({
      where: {
        id: payload.addressId,
        userId: jwtPayload.userId,
        isDeleted: false,
      },
      data: {
        userId: jwtPayload.userId,
        city: payload.city,
        street: payload.street,
        house: payload.house,
        latitude: payload.latitude,
        longitude: payload.longitude,
        label: payload.label,
      },
      select: this.addressSelect,
    }).catch((e) => {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 404,
          message: "Address not found",
        });
      }
      throw e;
    });

    return {
      ...address,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    };
  }

  async delete(
    payload: DeleteAddressPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    const address = await this.prisma.address.update({
      where: {
        id: payload.addressId,
        userId: jwtPayload.userId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
      select: this.addressSelect,
    }).catch((e) => {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 404,
          message: "Address not found",
        });
      }
      throw e;
    });

    return {
      ...address,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    };
  }

  async findOne(
    payload: FindOneAddressPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<AddressResponse> {
    const address = await this.prisma.address.findUnique({
      where: { id: payload.addressId },
      select: {
        ...this.addressSelect,
        userId: true,
        isDeleted: true,
      },
    });

    if (
      !address
      || (
        jwtPayload.role !== UserRole.ADMIN
        && (jwtPayload.userId !== address.userId || address.isDeleted))) {
      throw new RpcException({
        status: 404,
        message: "Address not found",
      });
    }

    return {
      id: address.id,
      city: address.city,
      createdAt: address.createdAt,
      house: address.house,
      street: address.street,
      label: address.label,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    };
  }

  async findMany(
    payload: FindManyAddressesPayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<FindManyApiResponse<AddressResponse>> {
    const where: any = {
      userId: jwtPayload.userId,
      isDeleted: false,
    };

    const [totalCount, addresses] = await this.prisma.$transaction([
      this.prisma.address.count({ where }),
      this.prisma.address.findMany({
        where,
        select: this.addressSelect,
        cursor: payload.lastId ? { id: payload.lastId } : undefined,
        skip: payload.lastId ? 1 : undefined,
        take: payload.count ?? 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedAddresses = addresses.map(address => ({
      ...address,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    }));

    return {
      total: totalCount,
      count: formattedAddresses.length,
      items: formattedAddresses,
    };
  }
}
