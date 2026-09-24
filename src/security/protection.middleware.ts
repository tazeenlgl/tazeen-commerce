import { Request, Response } from 'express';
import { sendError } from '../common/errors/error-response';
import { isHealthPath } from './rate-limit';

/** Caps concurrent in-flight requests per process; excess is shed with 503 before any work is done. */
export function createConcurrencyLimiter(max: number) {
  let inFlight = 0;
  return (req: Request, res: Response, next: () => void) => {
    if (isHealthPath(req)) return next();
    if (inFlight >= max) {
      return sendError(req, res, 503, 'Service Unavailable', 'Server is busy, please retry shortly', {
        'Retry-After': 1,
      });
    }
    inFlight += 1;
    let released = false;
    const release = () => {
      if (!released) {
        released = true;
        inFlight -= 1;
      }
    };
    res.on('close', release);
    next();
  };
}

/**
 * Responds 503 if a request has not completed in `ms`. Note: this frees the client;
 * it cannot cancel a handler already running (no DB/queue work exists yet).
 */
export function createTimeoutMiddleware(ms: number) {
  return (req: Request, res: Response, next: () => void) => {
    const timer = setTimeout(() => {
      sendError(req, res, 503, 'Service Unavailable', 'Request timed out');
      // A handler still running must not write to the finished response (avoids ERR_HTTP_HEADERS_SENT noise).
      const noop = () => res;
      Object.assign(res, { send: noop, json: noop, status: noop, set: noop, setHeader: noop, header: noop });
    }, ms);
    const clear = () => clearTimeout(timer);
    res.on('close', clear);
    res.on('finish', clear);
    next();
  };
}
