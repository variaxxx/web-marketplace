import { MinioService } from "../../infra/minio/minio.service";
import { Controller, Get, NotFoundException, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { InvalidBucketNameError } from "minio";

@Controller()
export class MediaPublicController {
  constructor(
    private readonly minio: MinioService,
  ) {}

  @Get("*path")
  async pfp(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const bucketName = req.path.split("/")[1];
    const filename = req.path.replace(`${bucketName}/`, "");

    const stream = await this.minio.getStream(bucketName, filename).catch((e) => {
      if (e.code === "NoSuchKey") {
        throw new NotFoundException("Not found");
      } else if (e.code === "NoSuchBucket" || e instanceof InvalidBucketNameError) {
        throw new NotFoundException("Not found");
      }
      throw e;
    });

    stream.pipe(res);
  }
}
