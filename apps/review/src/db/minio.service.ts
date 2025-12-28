import { EnvKey } from "../app/app.module";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { Buffer } from "node:buffer";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client!: Client;

  constructor(
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    this.client = new Client({
      endPoint: this.config.get<string>(EnvKey.MINIO_ENDPOINT) || "localhost",
      port: this.config.getOrThrow<number>(EnvKey.MINIO_PORT),
      accessKey: this.config.getOrThrow<string>(EnvKey.MINIO_ACCESS_KEY),
      secretKey: this.config.getOrThrow<string>(EnvKey.MINIO_SECRET_KEY),
      useSSL: false,
    });

    this.logger.log("Minio client initialized");
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

  async createBucket(
    bucketName: string,
  ): Promise<void> {
    const bucketExists = await this.client.bucketExists(bucketName);
    if (!bucketExists) {
      await this.client.makeBucket(bucketName);
    }
  }
}
