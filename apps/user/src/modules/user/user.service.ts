import { PrismaService } from "../../infra/db/prisma.service";
import { MediaService } from "../../infra/media/media.service";
import { Injectable } from "@nestjs/common";
import { GRPC_ERROR_CODE, MicroserviceError, PrismaQueryError, USER_ROLE, UserRegisteredPayload } from "@web-marketplace/backend";
import { EditProfilePayload, GetUserInfoPayload, UserInfoResponse } from "@web-marketplace/contracts/gen/user";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async create(
    payload: UserRegisteredPayload,
  ): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: payload.id,
          email: payload.email,
        },
      });
    } catch (e) {
      if (e.code === PrismaQueryError.UniqueConstraintViolation)
        return;
      throw e;
    }
  }

  async editProfile(
    payload: EditProfilePayload,
  ): Promise<UserInfoResponse> {
    let oldAvatarUrl: string | undefined;
    if (payload.avatarUrl) {
      const oldUser = await this.prisma.user.findUnique({
        where: { id: payload.userInfo.userId },
        select: { avatarUrl: true },
      });
      oldAvatarUrl = oldUser.avatarUrl;
    }

    const user = await this.prisma.user.update({
      where: { id: payload.userInfo.userId },
      data: {
        name: payload.name,
        phone: payload.phone,
        avatarUrl: payload.avatarUrl,
      },
      select: {
        name: true,
        phone: true,
        avatarUrl: true,
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound) {
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "User not found");
      }
      throw e;
    });

    if (oldAvatarUrl)
      await this.mediaService.deleteFile({ url: oldAvatarUrl });

    return user;
  }

  async getInfo(
    payload: GetUserInfoPayload,
  ): Promise<UserInfoResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        name: true,
        phone: true,
        avatarUrl: true,
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound) {
        throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "User not found");
      }
      throw e;
    });

    if (!user) {
      throw new MicroserviceError(GRPC_ERROR_CODE.NOT_FOUND, "User not found");
    }

    return {
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: !payload.userInfo || (payload.userInfo.role.toString() !== USER_ROLE.ADMIN && payload.userId !== payload.userInfo.userId)
        ? undefined
        : user.phone,
    };
  }
}
