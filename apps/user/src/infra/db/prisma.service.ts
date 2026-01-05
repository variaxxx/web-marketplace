import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/generated/userClient";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  onModuleInit(): Promise<void> {
    return this.$connect();
  }
}
