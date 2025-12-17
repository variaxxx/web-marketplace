import { InjectMinio } from "../../db/minio.module";
import { PrismaService } from "../../db/prisma.service";
import { EnvKey } from "../app.module";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RpcException } from "@nestjs/microservices";
import { AuthTokenPayload, CreateUserPayload, EditUserInfoPayload, GetUserInfoPayload, SetProfilePicturePayload, UserInfoResponse, UserRole } from "@web-marketplace/shared";
import { Client as MinioClient } from "minio";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

@Injectable()
export class UserService implements OnModuleInit {
  private readonly bucketName = "assets";

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectMinio() private readonly minio: MinioClient,
  ) {}

  async onModuleInit(): Promise<void> {
    const bucketExists = await this.minio.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minio.makeBucket(this.bucketName);
    }
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
    jwtPayload: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    try {
      const user = await this.prisma.user.update({
        where: { id: jwtPayload.userId },
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
    jwtPayload?: AuthTokenPayload,
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
      phone: !jwtPayload || (jwtPayload.role !== UserRole.ADMIN && payload.userId !== jwtPayload.userId)
        ? undefined
        : user.phone,
    };
  }

  async setProfilePicture(
    payload: SetProfilePicturePayload,
    jwtPayload: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    const oldUser = await this.prisma.user.findUnique({
      where: { id: jwtPayload.userId },
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
      Buffer.from(payload.image),
    );

    const user = await this.prisma.user.update({
      where: { id: jwtPayload.userId },
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
