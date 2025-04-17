import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentIp;
  },
);
