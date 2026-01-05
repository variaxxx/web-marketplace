import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/generated/authClient";

export type PrismaJsonObject = Prisma.JsonObject;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    while (true) {
      try {
        await this.$connect();
        this.logger.log("DB connection established");
        return;
      } catch (e) {
        this.logger.error(`DB connection failed, retrying... : ${e instanceof Error ? e.stack : e}`);
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }
}
