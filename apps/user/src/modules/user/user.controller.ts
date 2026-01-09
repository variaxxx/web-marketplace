import { RmqService } from "../../infra/rmq/rmq.service";
import { UserService } from "./user.service";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, GrpcMethod, Payload, RmqContext } from "@nestjs/microservices";
import { USER_RMQ_PATTERN, UserRegisteredPayload } from "@web-marketplace/backend";
import { GRPC_SERVICE_NAMES } from "@web-marketplace/contracts";
import { EditProfilePayload, GetMePayload, GetUserInfoPayload, UserInfoResponse } from "@web-marketplace/contracts/gen/user";

// TODO: findmany users
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rmq: RmqService,
  ) {}

  @EventPattern(USER_RMQ_PATTERN.USER_REGISTERED)
  async create(
    @Payload() payload: UserRegisteredPayload,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    try {
      await this.userService.create(payload);
      this.rmq.ack(ctx);
    } catch (e) {
      this.rmq.nack(ctx, true);
      throw e;
    }
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USER_SERVICE, "GetInfo")
  async getInfo(
    payload: GetUserInfoPayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.getInfo(payload);
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USER_SERVICE, "GetMe")
  async getMe(
    payload: GetMePayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.getInfo({ userInfo: payload.userInfo, userId: payload.userInfo.userId });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USER_SERVICE, "EditProfile")
  async editProfile(
    payload: EditProfilePayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.editProfile(payload);
  }
}
