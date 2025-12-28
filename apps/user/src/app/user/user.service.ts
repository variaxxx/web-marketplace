import { MinioService } from "../../db/minio.service";
import { PrismaService } from "../../db/prisma.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { CreateUserPayload, EditUserInfoPayload, GetUserInfoPayload, SetProfilePicturePayload, USER_ROLE, UserInfoResponse } from "@web-marketplace/shared";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

@Injectable()
export class UserService implements OnModuleInit {
  private readonly bucketName = "assets";

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.minio.createBucket(this.bucketName);
  }

  async create(
    payload: CreateUserPayload,
  ): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: payload.id,
        },
      });
    } catch (e) {
      if (e.code === "P2002")
        return;
      throw e;
    }
  }

  async editInfo(
    payload: EditUserInfoPayload,
  ): Promise<UserInfoResponse> {
    try {
      const user = await this.prisma.user.update({
        where: { id: payload.userInfo.userId },
        data: {
          name: payload.name,
          phone: payload.phone,
        },
        select: {
          name: true,
          phone: true,
          avatarId: true,
        },
      });

      return {
        ...user,
        avatarUrl: this.getAvatarUrl(user.avatarId),
      };
    } catch (e) {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 404,
          message: "User not found",
        });
      }
      throw e;
    }
  }

  async getInfo(
    payload: GetUserInfoPayload,
  ): Promise<UserInfoResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        name: true,
        phone: true,
        avatarId: true,
      },
    }).catch((e) => {
      if (e.code === "P2025") {
        throw new RpcException({
          status: 404,
          message: "User not found",
        });
      }
      throw e;
    });

    if (!user) {
      throw new RpcException({
        status: 404,
        message: "User not found",
      });
    }

    return {
      name: user.name,
      avatarUrl: this.getAvatarUrl(user.avatarId),
      phone: !payload.userInfo || (payload.userInfo.role !== USER_ROLE.ADMIN && payload.userId !== payload.userInfo.userId)
        ? undefined
        : user.phone,
    };
  }

  async setProfilePicture(
    payload: SetProfilePicturePayload,
  ): Promise<UserInfoResponse> {
    const oldUser = await this.prisma.user.findUnique({
      where: { id: payload.userInfo.userId },
      select: { avatarId: true },
    });

    if (!oldUser) {
      throw new RpcException({
        status: 404,
        message: "User not found",
      });
    }

    if (oldUser.avatarId)
      await this.removeFile(oldUser.avatarId);
    const filename = await this.uploadFile(
      Buffer.from(payload.image.buffer),
      payload.image.mimetype,
    );

    const user = await this.prisma.user.update({
      where: { id: payload.userInfo.userId },
      data: { avatarId: filename },
    });

    return {
      name: user.name,
      phone: user.phone,
      avatarUrl: this.getAvatarUrl(user.avatarId),
    };
  }

  private getAvatarUrl(
    filename: string | null,
  ): string | null {
    if (!filename)
      return null;

    return `${this.bucketName}/${filename}`;
  }

  private async uploadFile(
    file: Buffer,
    mimetype: string,
  ): Promise<any> {
    const filename = randomUUID().toString();
    await this.minio.upload(
      this.bucketName,
      filename,
      file,
      mimetype,
    );
    return filename;
  }

  private async removeFile(filename: string): Promise<void> {
    await this.minio.remove(
      this.bucketName,
      filename,
    );
  }
}
