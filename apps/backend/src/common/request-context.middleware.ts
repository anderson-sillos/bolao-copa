import { randomUUID } from 'node:crypto';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const suppliedRequestId = request.header('x-request-id');
    const requestId =
      suppliedRequestId && REQUEST_ID_PATTERN.test(suppliedRequestId)
        ? suppliedRequestId
        : randomUUID();
    const startedAt = performance.now();

    response.setHeader('X-Request-Id', requestId);
    response.on('finish', () => {
      this.logger.log({
        requestId,
        method: request.method,
        path: request.originalUrl || request.url,
        statusCode: response.statusCode,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
      });
    });

    next();
  }
}
