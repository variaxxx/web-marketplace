import { EnvKey } from "../../core/config/env-key.enum";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MediaBucket } from "@web-marketplace/contracts/gen/media";
import { Client } from "minio";
import { Buffer } from "node:buffer";
import Stream from "node:stream";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client!: Client;

  constructor(
    private readonly config: ConfigService,
  ) {}

  public bucketsMap: Record<keyof typeof MediaBucket, string> = {
    AVATAR: "avatar",
    MESSAGE: "msg",
    PRODUCT: "product",
    REVIEW: "review",
    UNRECOGNIZED: null,
  };

  async onModuleInit(): Promise<void> {
    while (true) {
      try {
        this.client = new Client({
          endPoint: this.config.get<string>(EnvKey.MINIO_ENDPOINT) || "localhost",
          port: this.config.getOrThrow<number>(EnvKey.MINIO_PORT),
          accessKey: this.config.getOrThrow<string>(EnvKey.MINIO_ACCESS_KEY),
          secretKey: this.config.getOrThrow<string>(EnvKey.MINIO_SECRET_KEY),
          useSSL: false,
        });

        for (const bucket of Object.values(this.bucketsMap).filter(Boolean)) {
          await this.createBucket(bucket);
        }

        this.logger.log("Minio client initialized");
        break;
      } catch (e) {
        this.logger.error(`Minio connection failed, retrying...: ${e instanceof Error ? e.stack : e}`);
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }

  async upload(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    await this.client.putObject(
      bucket,
      objectName,
      buffer,
      buffer.length,
      {
        "Content-Type": mimetype,
      },
    );

    return objectName;
  }

  async remove(
    bucket: string,
    objectName: string,
  ): Promise<void> {
    await this.client.removeObject(
      bucket,
      objectName,
    );
  }

  async getStream(
    bucket: string,
    objectName: string,
  ): Promise<Stream.Readable> {
    return this.client.getObject(bucket, objectName);
  }

  async createBucket(
    bucketName: string,
  ): Promise<void> {
    const bucketExists = await this.client.bucketExists(bucketName);
    if (!bucketExists) {
      await this.client.makeBucket(bucketName);
    }
  }
}
