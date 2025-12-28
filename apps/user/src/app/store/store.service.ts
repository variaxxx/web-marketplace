import { MinioService } from "../../db/minio.service";
import { PrismaService } from "../../db/prisma.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RpcException } from "@nestjs/microservices";
import { FindOneStorePayload, SetStorePicturePayload, StoreInfoResponse, USER_ROLE } from "@web-marketplace/shared";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

@Injectable()
export class StoreService {
  private readonly bucketName = "assets";

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly minio: MinioService,
  ) {}

  async getInfo(
    payload: FindOneStorePayload,
  ): Promise<StoreInfoResponse> {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: payload.ownerId },
      select: {
        name: true,
        description: true,
        avatarId: true,
      },
    });

    if (!store) {
      throw new RpcException({
        status: 404,
        message: "Store not found",
      });
    }

    return {
      id: payload.ownerId,
      name: store.name,
      description: store.description,
      avatarUrl: this.getAvatarUrl(store.avatarId),
    };
  }

  async setStorePicture(
    payload: SetStorePicturePayload,
  ): Promise<StoreInfoResponse> {
    if (payload.userInfo.role !== USER_ROLE.SELLER) {
      throw new RpcException({
        status: 403,
        message: "Forbidden",
      });
    }

    const oldStore = await this.prisma.store.findUnique({
      where: { ownerId: payload.userInfo.userId },
      select: { avatarId: true },
    });

    if (!oldStore) {
      throw new RpcException({
        status: 404,
        message: "Store not found",
      });
    }

    if (oldStore.avatarId)
      await this.removeFile(oldStore.avatarId);
    const filename = await this.uploadFile(
      Buffer.from(payload.image.buffer),
      payload.image.mimetype,
    );

    const store = await this.prisma.store.update({
      where: { ownerId: payload.userInfo.userId },
      data: { avatarId: filename },
    });

    return {
      id: store.ownerId,
      description: store.description,
      name: store.name,
      avatarUrl: this.getAvatarUrl(filename),
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
