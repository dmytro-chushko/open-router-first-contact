import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

type ZodIssue = {
  path: (string | number)[];
  message: string;
  code?: string;
};

type ValidationIssue = {
  field: string;
  message: string;
};

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor() {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (
      exception &&
      typeof exception === 'object' &&
      (() => {
        const e = exception as Record<string, unknown>;
        const isZod = (k: string) =>
          (e[k] as { name?: string } | undefined)?.name === 'ZodError';

        return (
          isZod('bodyResult') ||
          isZod('paramsResult') ||
          isZod('queryResult') ||
          isZod('headersResult') ||
          isZod('body')
        );
      })()
    ) {
      const e = exception as Record<string, unknown>;
      const candidates = [
        'bodyResult',
        'paramsResult',
        'queryResult',
        'headersResult',
        'body',
      ] as const;
      type ZodLike = { name?: string; issues?: unknown; errors?: unknown };
      const isZodLike = (val: unknown): val is ZodLike =>
        typeof val === 'object' &&
        val !== null &&
        'name' in val &&
        (val as { name?: string }).name === 'ZodError';
      const zodError = candidates.map((k) => e[k]).find(isZodLike);

      const issues = zodError?.issues || zodError?.errors;

      if (Array.isArray(issues) && issues.length > 0) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          error: 'Validation error',
          issues: this.formatZodIssuesToArray(issues as ZodIssue[]),
        });
      }
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus() as HttpStatus;
      const exceptionResponse = exception.getResponse();

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `Internal server error: ${exception.message}`,
          exception.stack,
        );

        return response.status(status).json({
          status,
          error: 'Something went wrong',
        });
      }

      if (
        status === HttpStatus.BAD_REQUEST &&
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'issues' in exceptionResponse
      ) {
        const payload = exceptionResponse as {
          error?: unknown;
          issues: unknown;
        };
        const errorText =
          typeof payload.error === 'string'
            ? payload.error
            : 'Validation error';
        const issues = Array.isArray(payload.issues) ? payload.issues : [];

        return response.status(status).json({
          status,
          error: errorText,
          issues,
        });
      }

      let errorMessage: string;

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        if ('message' in exceptionResponse) {
          const msg = (exceptionResponse as { message?: unknown }).message;
          errorMessage = Array.isArray(msg)
            ? msg.join('; ')
            : typeof msg === 'string'
              ? msg
              : exception.message;
        } else {
          errorMessage = exception.message;
        }
      } else {
        errorMessage = exception.message;
      }

      return response.status(status).json({
        status,
        error: errorMessage,
      });
    }

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception && typeof exception === 'object') {
      const e = exception as Record<string, unknown>;

      if (typeof e.status === 'number') {
        status = e.status;
      } else if (typeof e.statusCode === 'number') {
        status = e.statusCode;
      }
    }

    const errObj =
      exception && typeof exception === 'object'
        ? (exception as Record<string, unknown>)
        : undefined;
    const unhandledMessage =
      typeof errObj?.message === 'string' ? errObj.message : 'Unknown error';
    const unhandledStack =
      typeof errObj?.stack === 'string' ? errObj.stack : undefined;

    this.logger.error(`Unhandled error: ${unhandledMessage}`, unhandledStack);

    return response.status(status).json({
      status,
      error: 'Something went wrong',
    });
  }

  private formatZodIssuesToArray(issues: ZodIssue[]): ValidationIssue[] {
    return issues.map((issue) => {
      const field = issue.path.length > 0 ? issue.path.join('.') : 'root';

      return {
        field,
        message: issue.message,
      };
    });
  }
}
