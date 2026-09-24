import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';
export interface RateLimitOptions {
  limit?: number; // defaults to STRICT env values
  windowSec?: number;
}

/** Apply a stricter per-client limit to a route/controller (e.g. future login, OTP, password reset). */
export const StrictRateLimit = (opts: RateLimitOptions = {}) => SetMetadata(RATE_LIMIT_KEY, opts);
