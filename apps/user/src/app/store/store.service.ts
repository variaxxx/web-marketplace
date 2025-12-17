import { InjectMinio } from "../../db/minio.module";
import { PrismaService } from "../../db/prisma.service";
import { EnvKey } from "../app.module";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RpcException } from "@nestjs/microservices";
import { AuthTokenPayload, GetStoreInfoPayload, SetStorePicturePayload, StoreInfoResponse, UserRole } from "@web-marketplace/shared";
import { Client as MinioClient } from "minio";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

@Injectable()
export class StoreService {
  private readonly bucketName = "assets";

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectMinio() private readonly minio: MinioClient,
  ) {}

  async getInfo(
    payload: GetStoreInfoPayload,
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
    jwtPayload: AuthTokenPayload,
  ): Promise<StoreInfoResponse> {
    if (jwtPayload.role !== UserRole.SELLER) {
      throw new RpcException({
        status: 403,
        message: "Forbidden",
      });
    }

    const oldStore = await this.prisma.store.findUnique({
      where: { ownerId: jwtPayload.userId },
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
      Buffer.from(payload.image),
    );

    const store = await this.prisma.store.update({
      where: { ownerId: jwtPayload.userId },
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

    const domain = this.configService.getOrThrow(EnvKey.API_DOMAIN);
    return `${domain}assets/${filename}`;
  }

  private async uploadFile(file: Buffer): Promise<any> {
    const filename = randomUUID().toString();
    await this.minio.putObject(
      this.bucketName,
      filename,
      file,
      undefined,
    );
    return filename;
  }

  private async removeFile(filename: string): Promise<void> {
    await this.minio.removeObject(
      this.bucketName,
      filename,
    );
  }
}
