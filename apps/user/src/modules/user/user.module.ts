import { MediaModule } from "../../infra/media/media.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    MediaModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {};
