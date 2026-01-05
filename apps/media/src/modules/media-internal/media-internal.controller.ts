import { RmqService } from "../../infra/rmq/rmq.service";
import { MediaInternalService } from "./media-internal.service";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, GrpcMethod, Payload, RmqContext } from "@nestjs/microservices";
import { DeleteFilePayload, MEDIA_PATTERNS } from "@web-marketplace/backend";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { UploadFilePayload, UploadFileResponse } from "@web-marketplace/contracts/gen/media";

@Controller()
export class MediaInternalController {
  constructor(
    private readonly service: MediaInternalService,
    private readonly rmq: RmqService,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.MEDIA_SERVICE, "UploadFile")
  async uploadFile(
    payload: UploadFilePayload,
  ): Promise<UploadFileResponse> {
    return this.service.uploadFile(payload);
  }

  @EventPattern(MEDIA_PATTERNS.FILE_DELETION)
  async deleteFile(
    @Payload() payload: DeleteFilePayload,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    try {
      await this.service.deleteFile(payload);
      this.rmq.ack(ctx);
    } catch (e) {
      console.error(e);
      this.rmq.nack(ctx);
      throw e;
    }
  }
}
