import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayloadUser } from '@/modules/auth/types/jwt-payload';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayloadUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as JwtPayloadUser;
  },
);
