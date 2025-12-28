import { UserService } from "./user.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { CreateUserPayload, EditUserInfoPayload, GetMePayload, GetUserInfoPayload, SetProfilePicturePayload, USER_PATTERNS, UserInfoResponse } from "@web-marketplace/shared";

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @EventPattern(USER_PATTERNS.USER.CREATE)
  async create(
    @Payload() payload: CreateUserPayload,
  ): Promise<void> {
    return await this.userService.create(payload);
  }

  @MessagePattern(USER_PATTERNS.USER.GET_INFO)
  async getInfo(
    @Payload() payload: GetUserInfoPayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.getInfo(payload);
  }

  @MessagePattern(USER_PATTERNS.USER.GET_ME)
  async getMe(
    @Payload() payload: GetMePayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.getInfo({ userInfo: payload.userInfo, userId: payload.userInfo.userId });
  }

  @MessagePattern(USER_PATTERNS.USER.EDIT_INFO)
  async editInfo(
    @Payload() payload: EditUserInfoPayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.editInfo(payload);
  }

  @MessagePattern(USER_PATTERNS.USER.SET_PROFILE_PICTURE)
  async setPfp(
    @Payload() payload: SetProfilePicturePayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.setProfilePicture(payload);
  }
}
