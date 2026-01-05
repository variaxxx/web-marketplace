import { MinioService } from "../../infra/minio/minio.service";
import { Injectable } from "@nestjs/common";
import { DeleteFilePayload, GRPC_ERROR_CODE, MicroserviceError } from "@web-marketplace/backend";
import { UploadFilePayload, UploadFileResponse } from "@web-marketplace/contracts/gen/media";
import { Buffer } from "node:buffer";

@Injectable()
export class MediaInternalService {
  constructor(
    private readonly minio: MinioService,
  ) {}

  // TODO: resize
  public async uploadFile(
    payload: UploadFilePayload,
  ): Promise<UploadFileResponse> {
    const bucket = this.minio.bucketsMap[payload.bucket];
    const { filename, file, contentType } = payload;

    if (!bucket)
      throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Invalid bucket");

    await this.minio.upload(
      bucket,
      filename,
      Buffer.from(file),
      contentType,
    );

    return {
      url: `${bucket}/${filename}`,
    };
  }

  public async deleteFile(
    payload: DeleteFilePayload,
  ): Promise<void> {
    const bucket = payload.url.split("/")[0];
    const filename = payload.url.replace(`${bucket}/`, "");

    if (!Object.values(this.minio.bucketsMap).includes(bucket))
      throw new MicroserviceError(GRPC_ERROR_CODE.INVALID_ARGUMENT, "Invalid bucket");

    await this.minio.remove(
      bucket,
      filename,
    ).catch((e) => {
      if (e.code === "NoSuchKey") {
        return;
      }
      throw e;
    }); ;
  }
}
