import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const UserInfo = createParamDecorator(
  (optional: boolean = false, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const userInfo = req?.userInfo;

    if (!optional && !userInfo) {
      throw new UnauthorizedException("Unauthorized");
    }

    return userInfo;
  },
);
