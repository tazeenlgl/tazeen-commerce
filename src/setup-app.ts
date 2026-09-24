import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RATE_LIMIT_STORE } from './security/rate-limit-store';
import { createRateLimitMiddleware } from './security/rate-limit';
import { createConcurrencyLimiter, createTimeoutMiddleware } from './security/protection.middleware';
import { requestLogger } from './common/middleware/request-logger.middleware';

/** Shared by main.ts and tests so both run the same pipeline. */
export function setupApp(app: NestExpressApplication): void {
  const cfg = configuration();
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI }); // controllers opt in: /api/v1/...
  const sec = cfg.security;
  app.set('trust proxy', sec.trustProxy);
  app.disable('x-powered-by');
  app.use(helmet());
  // Cheap rejections first, before body parsing / routing / business logic.
  app.use(createConcurrencyLimiter(sec.maxConcurrentRequests));
  app.use(createTimeoutMiddleware(sec.requestTimeoutMs));
  app.use(
    createRateLimitMiddleware(app.get(RATE_LIMIT_STORE), {
      limit: sec.rateLimitMax,
      windowMs: sec.rateLimitWindowSec * 1000,
    }),
  );
  app.useBodyParser('json', { limit: cfg.bodyLimit });
  app.useBodyParser('urlencoded', { limit: cfg.bodyLimit, extended: true });
  app.use(requestLogger);
  app.enableCors({ origin: cfg.corsOrigins.length ? cfg.corsOrigins : false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();
}
