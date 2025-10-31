import { UserService } from "./user.service";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { CreateUserPayload, USER_PATTERNS } from "@web-marketplace/shared";

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @EventPattern(USER_PATTERNS.CREATE_USER)
  async createUser(
    @Payload() payload: CreateUserPayload,
  ): Promise<void> {
    return await this.userService.createUser(payload);
  }
}
