import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/generated/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  onModuleInit(): Promise<void> {
    return this.$connect();
  }
}
