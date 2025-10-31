import { Injectable, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/generated/userClient";

export type PrismaJsonObject = Prisma.JsonObject;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  onModuleInit(): Promise<void> {
    return this.$connect();
  }
}
