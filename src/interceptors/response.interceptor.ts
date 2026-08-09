import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { SKIP_RESPONSE_ENVELOPE_KEY } from '../decorators/skip-response-envelope.decorator';
import { ApiSuccess } from '@/utils/api-response.dto';
import { KeysetResult, PaginatedResult } from '@/utils/pagination.dto';

function isPaginated<T>(value: unknown): value is PaginatedResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as PaginatedResult<T>).items) &&
    'meta' in value
  );
}

function isKeyset<T>(value: unknown): value is KeysetResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as KeysetResult<T>).items) &&
    'nextCursor' in value
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccess<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccess<T>> {
    const skipEnvelope = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_ENVELOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipEnvelope) {
      return next.handle() as Observable<ApiSuccess<T>>;
    }

    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode;

    const message = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const msg: string = message ?? 'Successfully completed the request';

    return next.handle().pipe(
      map((payload): ApiSuccess<T> => {
        if (isPaginated<T>(payload)) {
          return {
            success: true,
            statusCode,
            message: msg,
            data: payload.items as unknown as T,
            meta: payload.meta,
          };
        }

        if (isKeyset<T>(payload)) {
          return {
            success: true,
            statusCode,
            message: msg,
            data: payload.items as unknown as T,
            meta: { nextCursor: payload.nextCursor, hasMore: payload.hasMore },
          };
        }

        return { success: true, statusCode, message: msg, data: payload };
      }),
    );
  }
}
