import { InjectMinio } from "./assets.decorator";
import { Controller, Get, NotFoundException, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Client as MinioClient } from "minio";

@Controller("s3")
export class AssetsController {
  constructor(
    @InjectMinio() private readonly minio: MinioClient,
  ) {}

  @Get("*path")
  async pfp(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const bucketName = req.path.split("/")[2];
    const filename = req.path.replace(`/s3/${bucketName}/`, "");

    const stream = await this.minio.getObject(bucketName, filename).catch((e) => {
      if (e.code === "NoSuchKey") {
        throw new NotFoundException("Not found");
      }
      throw e;
    });

    stream.pipe(res);
  }
}
