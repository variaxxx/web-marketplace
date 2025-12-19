import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const AccessToken = createParamDecorator(
  (optional: boolean = false, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.accessToken;

    if (!token && !optional) {
      throw new UnauthorizedException("Access token required");
    }

    return token;
  },
);
