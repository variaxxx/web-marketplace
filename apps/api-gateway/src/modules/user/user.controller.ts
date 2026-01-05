import { MediaClientGrpc } from "../../infra/media/media.grpc";
import { ApiFormattedResponse, IsPublic, pictureFileFilter, UserInfo } from "../../shared";
import { EditUserInfoRequest, UserInfoResponse } from "./dto";
import { UserClientGrpc } from "./user.grpc";
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation } from "@nestjs/swagger";
import { AuthTokenPayload } from "@web-marketplace/backend";
import { MediaBucket } from "@web-marketplace/contracts/gen/media";
import { UserInfoResponse as UserInfoGrpcResponse } from "@web-marketplace/contracts/gen/user";
import { randomBytes } from "node:crypto";

@Controller("user")
export class UserController {
  private toResponseDto(
    userInfo: UserInfoGrpcResponse,
  ): UserInfoResponse {
    return {
      phone: userInfo.phone ?? null,
      name: userInfo.name ?? null,
      avatarUrl: userInfo.avatarUrl ?? null,
    };
  };

  constructor(
    private readonly client: UserClientGrpc,
    private readonly mediaClient: MediaClientGrpc,
  ) {}

  @ApiOperation({ summary: "Editing your profile" })
  @ApiFormattedResponse(HttpStatus.OK, UserInfoResponse)
  @HttpCode(HttpStatus.OK)
  @Patch("me")
  async editInfo(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: EditUserInfoRequest,
  ): Promise<UserInfoResponse> {
    const res = await this.client.call("editProfile", {
      userInfo,
      ...dto,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({ summary: "Getting information about yourself" })
  @ApiFormattedResponse(HttpStatus.OK, UserInfoResponse)
  @HttpCode(HttpStatus.OK)
  @Get("me")
  async getMe(
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    const res = await this.client.call("getMe", {
      userInfo,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({ summary: "Change avatar" })
  @ApiFormattedResponse(HttpStatus.OK, UserInfoResponse)
  @HttpCode(HttpStatus.OK)
  @Post("pfp")
  @UseInterceptors(FileInterceptor("image", {
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
    fileFilter: pictureFileFilter,
  }))
  async setPfp(
    @UserInfo() userInfo: AuthTokenPayload,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UserInfoResponse> {
    const { url: avatarUrl } = await this.mediaClient.call("uploadFile", {
      bucket: MediaBucket.AVATAR,
      contentType: image.mimetype,
      filename: randomBytes(16).toString("hex"),
      file: new Uint8Array(image.buffer),
      resizeHeight: 512,
      resizeWidth: 512,
    });

    const res = await this.client.call("editProfile", {
      userInfo,
      avatarUrl,
    });

    return this.toResponseDto(res);
  }

  @ApiOperation({ summary: "Getting information about a user by ID" })
  @ApiFormattedResponse(HttpStatus.OK, UserInfoResponse)
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async getInfo(
    @Param("id") id: string,
    @UserInfo(true) userInfo?: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    const res = await this.client.call("getInfo", {
      userInfo,
      userId: id,
    });

    return this.toResponseDto(res);
  }
}
