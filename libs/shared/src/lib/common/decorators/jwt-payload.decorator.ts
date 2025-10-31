import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const JwtPayload = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const meta = ctx.switchToRpc().getContext() as any;
    const payload = meta?.jwtPayload;
    return data ? payload?.[data] : payload;
  },
);
