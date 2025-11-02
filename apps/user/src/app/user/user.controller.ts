import { UserService } from "./user.service";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AuthTokenPayload, CreateUserPayload, EditUserInfoPayload, GetMePayload, GetUserInfoPayload, IsPublic, JwtPayload, SetProfilePicturePayload, USER_PATTERNS, UserInfoResponse } from "@web-marketplace/shared";

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @IsPublic()
  @EventPattern(USER_PATTERNS.CREATE_USER)
  async create(
    @Payload() payload: CreateUserPayload,
  ): Promise<void> {
    return await this.userService.create(payload);
  }

  @IsPublic()
  @MessagePattern(USER_PATTERNS.GET_USER_INFO)
  async getInfo(
    @Payload() payload: GetUserInfoPayload,
    @JwtPayload() jwtPayload?: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.getInfo(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.GET_ME)
  async getMe(
    @Payload() payload: GetMePayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.getInfo({ accessToken: payload.accessToken, userId: jwtPayload.userId }, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.EDIT_USER_INFO)
  async editInfo(
    @Payload() payload: EditUserInfoPayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.editInfo(payload, jwtPayload);
  }

  @MessagePattern(USER_PATTERNS.SET_PROFILE_PICTURE)
  async setPfp(
    @Payload() payload: SetProfilePicturePayload,
    @JwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<UserInfoResponse> {
    return await this.userService.setProfilePicture(payload, jwtPayload);
  }
}
