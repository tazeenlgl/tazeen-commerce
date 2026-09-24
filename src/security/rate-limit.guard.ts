import { CanActivate, ExecutionContext, HttpException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import configuration from '../config/configuration';
import { RATE_LIMIT_KEY, RateLimitOptions } from './rate-limit.decorator';
import { RATE_LIMIT_STORE, RateLimitStore } from './rate-limit-store';
import { clientKey, consume } from './rate-limit';

@Injectable()
export class StrictRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(RATE_LIMIT_STORE) private readonly store: RateLimitStore,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const opts = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(RATE_LIMIT_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!opts) return true;
    const { security } = configuration();
    const rule = {
      limit: opts.limit ?? security.strictMax,
      windowMs: (opts.windowSec ?? security.strictWindowSec) * 1000,
    };
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request>();
    const route = `${ctx.getClass().name}.${ctx.getHandler().name}`;
    const ok = await consume(this.store, http.getResponse<Response>(), `strict:${route}:${clientKey(req)}`, rule);
    if (!ok) throw new HttpException('Too many requests, please try again later', 429);
    return true;
  }
}
