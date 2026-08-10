import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorDto } from '@/common/dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const body = this.buildErrorBody(exception);
    response.status(body.statusCode).json(body);
  }

  private buildErrorBody(exception: unknown): ApiErrorDto {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return {
          success: false,
          statusCode,
          message: exceptionResponse,
        };
      }

      const payload = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(payload.message)) {
        return {
          success: false,
          statusCode,
          message: payload.error ?? 'Validation failed',
          errors: payload.message,
        };
      }

      return {
        success: false,
        statusCode,
        message:
          typeof payload.message === 'string'
            ? payload.message
            : (payload.error ?? exception.message),
      };
    }

    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
