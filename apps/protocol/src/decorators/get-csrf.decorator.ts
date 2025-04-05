import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export const GetCsrf = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const csrf = request.csrf;

    if (!csrf) throw new ForbiddenException();

    return csrf;
  },
);
