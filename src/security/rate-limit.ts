import { Request, Response } from 'express';
import { sendError } from '../common/errors/error-response';
import { RateLimitStore } from './rate-limit-store';

export interface LimitRule {
  limit: number;
  windowMs: number;
}

export function clientKey(req: Request): string {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/** Consumes one hit, sets RateLimit-* headers, returns false (and Retry-After set) if exceeded. */
export async function consume(
  store: RateLimitStore,
  res: Response,
  key: string,
  rule: LimitRule,
): Promise<boolean> {
  const { count, resetAt } = await store.hit(key, rule.windowMs);
  const resetSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  res.setHeader('RateLimit-Limit', String(rule.limit));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, rule.limit - count)));
  res.setHeader('RateLimit-Reset', String(resetSec));
  if (count > rule.limit) {
    res.setHeader('Retry-After', String(resetSec));
    return false;
  }
  return true;
}

export function tooManyRequests(req: Request, res: Response) {
  sendError(req, res, 429, 'Too Many Requests', 'Too many requests, please try again later');
}

export function isHealthPath(req: Request): boolean {
  return req.path === '/api/health';
}

/** Global per-client limiter; runs before body parsing and routing. */
export function createRateLimitMiddleware(store: RateLimitStore, rule: LimitRule) {
  return async (req: Request, res: Response, next: (e?: unknown) => void) => {
    if (isHealthPath(req)) return next();
    try {
      if (await consume(store, res, `global:${clientKey(req)}`, rule)) return next();
    } catch (e) {
      return next(e);
    }
    tooManyRequests(req, res);
  };
}
