import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { STATUS_CODES } from 'http';
import { Request, Response } from 'express';
import { sendError } from '../errors/error-response';

/** Error shape: { statusCode, error, message, path, timestamp }. Never leaks stacks or internals. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let statusCode = 500;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : ((body as { message?: string | string[] }).message ?? exception.message);
    } else {
      // body-parser / http-errors style client errors (too large, malformed JSON, ...)
      const e = exception as { status?: number; type?: string };
      if (typeof e?.status === 'number' && e.status >= 400 && e.status < 500) {
        statusCode = e.status;
        message =
          e.type === 'entity.too.large' ? 'Request body too large'
          : e.type === 'entity.parse.failed' ? 'Malformed request body'
          : (STATUS_CODES[statusCode] ?? 'Bad request');
      } else {
        this.logger.error(exception instanceof Error ? exception.message : String(exception),
          exception instanceof Error ? exception.stack : undefined);
      }
    }
    sendError(req, res, statusCode, STATUS_CODES[statusCode] ?? 'Error', message);
  }
}
