import { PrismaService } from "../../db/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateUserPayload } from "@web-marketplace/shared";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createUser(
    payload: CreateUserPayload,
  ): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: payload.id,
        },
      });
    } catch (e) {
      if (e.code === "P2002")
        return;
      throw e;
    }
  }
}
