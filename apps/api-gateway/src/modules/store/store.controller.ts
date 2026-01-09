import { MediaClientGrpc } from "../../infra/media/media.grpc";
import { AllowedRoles, ApiFormattedResponse, IsPublic, pictureFileFilter, UserInfo } from "../../shared";
import { EditStoreInfoRequest, StoreInfoResponse } from "./dto";
import { StoreClientGrpc } from "./store.grpc";
import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { AuthTokenPayload, normalizeText, USER_ROLE } from "@web-marketplace/backend";
import { MediaBucket } from "@web-marketplace/contracts/gen/media";
import { ValueChange, ValueChange_OperationType } from "@web-marketplace/contracts/gen/store";
import { randomBytes } from "node:crypto";

@Controller("stores")
export class StoreController {
  constructor(
    private readonly client: StoreClientGrpc,
    private readonly mediaClient: MediaClientGrpc,
  ) {}

  @ApiOperation({
    summary: "Getting information about your store",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    StoreInfoResponse,
  )
  @HttpCode(HttpStatus.OK)
  @Get("my")
  @AllowedRoles(USER_ROLE.SELLER)
  async getMy(
    @UserInfo() userInfo: AuthTokenPayload,
  ): Promise<StoreInfoResponse> {
    const res = await this.client.call("getInfo", {
      ownerId: userInfo.userId,
    });

    return {
      id: res.id,
      name: res.name,
      description: res.description ?? null,
      avatarUrl: res.avatarUrl ?? null,
    };
  }

  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        avatar: {
          type: "string",
          format: "binary",
          nullable: true,
        },
        removeAvatar: {
          type: "string",
          enum: ["true", "false"],
          nullable: true,
        },
        name: {
          type: "string",
          example: "My new store name",
          nullable: true,
        },
        description: {
          type: "string",
          example: "My new store description",
          nullable: true,
        },
      },
    },
  })
  @ApiOperation({
    summary: "Changing your store information",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
  )
  @HttpCode(HttpStatus.OK)
  @Patch("my")
  @AllowedRoles(USER_ROLE.SELLER)
  @UseInterceptors(FileInterceptor("avatar", {
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
    fileFilter: pictureFileFilter,
  }))
  async editMy(
    @UserInfo() userInfo: AuthTokenPayload,
    @Body() dto: EditStoreInfoRequest,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<void> {
    const changes = await this.extractStoreChanges(dto, image);

    return void await this.client.call("editInfo", {
      userInfo,
      changes,
    });
  }

  @ApiOperation({
    summary: "Obtaining information about a store by ID",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    StoreInfoResponse,
  )
  @HttpCode(HttpStatus.OK)
  @Get(":storeId")
  @IsPublic()
  async getById(
    @Param("storeId") storeId: string,
  ): Promise<StoreInfoResponse> {
    const res = await this.client.call("getInfo", {
      storeId,
    });

    return {
      id: res.id,
      name: res.name,
      description: res.description ?? null,
      avatarUrl: res.avatarUrl ?? null,
    };
  }

  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        avatar: {
          type: "string",
          format: "binary",
          nullable: true,
        },
        removeAvatar: {
          type: "string",
          enum: ["true", "false"],
          nullable: true,
        },
        name: {
          type: "string",
          example: "My new store name",
          nullable: true,
        },
        description: {
          type: "string",
          example: "My new store description",
          nullable: true,
        },
      },
    },
  })
  @ApiOperation({
    summary: "Changing store information without confirmation",
  })
  @ApiFormattedResponse(
    HttpStatus.OK,
    StoreInfoResponse,
  )
  @HttpCode(HttpStatus.OK)
  @Patch(":storeId")
  @AllowedRoles(USER_ROLE.ADMIN)
  @UseInterceptors(FileInterceptor("avatar", {
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
    fileFilter: pictureFileFilter,
  }))
  async editInfoImmediate(
    @Param("storeId") storeId: string,
    @Body() dto: EditStoreInfoRequest,
    @UserInfo() userInfo: AuthTokenPayload,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<StoreInfoResponse> {
    const changes = await this.extractStoreChanges(dto, image);

    const res = await this.client.call("editInfoImmediate", {
      userInfo,
      changes,
      storeId,
    });

    return {
      ...res,
      avatarUrl: res.avatarUrl ?? null,
      description: res.description ?? null,
    };
  }

  private async extractStoreChanges(
    dto: EditStoreInfoRequest,
    image: Express.Multer.File,
  ): Promise<ValueChange[]> {
    const changes: ValueChange[] = [];

    if (dto.name !== undefined) {
      changes.push({
        fieldName: "name",
        type: ValueChange_OperationType.SET,
        newValue: normalizeText(dto.name, "name"),
      });
    }

    if (dto.description !== undefined) {
      if (dto.description === "") {
        changes.push({
          fieldName: "description",
          type: ValueChange_OperationType.CLEAR,
        });
      } else {
        changes.push({
          fieldName: "description",
          type: ValueChange_OperationType.SET,
          newValue: dto.description,
        });
      }
    }

    if (dto.removeAvatar === "true") {
      if (image)
        throw new BadRequestException("Remove flag and file cannot be provided at the same time");

      changes.push({
        fieldName: "avatarUrl",
        type: ValueChange_OperationType.CLEAR,
      });
    } else if (image) {
      const { url: avatarUrl } = await this.mediaClient.call("uploadFile", {
        bucket: MediaBucket.AVATAR,
        contentType: image.mimetype,
        filename: randomBytes(16).toString("hex"),
        file: new Uint8Array(image.buffer),
        resizeHeight: 512,
        resizeWidth: 512,
      });
      changes.push({
        fieldName: "avatarUrl",
        type: ValueChange_OperationType.SET,
        newValue: avatarUrl,
      });
    }

    return changes;
  }
}
