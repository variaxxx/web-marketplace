import { InjectMinio } from "./minio.decorator";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Response } from "express";
import { Client as MinioClient } from "minio";

@Controller("assets")
export class AssetsController {
  private readonly bucketName = "assets";

  constructor(
    @InjectMinio() private readonly minio: MinioClient,
  ) {}

  @Get(":filename")
  async pfp(
    @Param("filename") filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const stream = await this.minio.getObject(this.bucketName, filename).catch((e) => {
      if (e.code === "NoSuchKey") {
        throw new RpcException({
          status: 404,
          message: "Not found",
        });
      }
      throw e;
    });

    stream.pipe(res);
  }
}
