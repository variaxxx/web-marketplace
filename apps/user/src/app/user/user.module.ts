import { PrismaModule } from "../../db/prisma.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {};
