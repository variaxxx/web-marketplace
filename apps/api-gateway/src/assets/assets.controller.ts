import { InjectMinio } from "./minio.decorator";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Response } from "express";
import { fileTypeFromBuffer } from "file-type";
import { Client as MinioClient } from "minio";
import { Buffer } from "node:buffer";

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

    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const fileType = await fileTypeFromBuffer(buffer);
    res.setHeader("Content-Type", fileType.mime);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    res.send(buffer);
  }
}
