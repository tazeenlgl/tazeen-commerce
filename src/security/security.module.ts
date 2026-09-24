import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { StrictRateLimitGuard } from './rate-limit.guard';
import { MemoryRateLimitStore, RATE_LIMIT_STORE } from './rate-limit-store';

// To go multi-instance: replace useClass with a Redis-backed RateLimitStore.
@Global()
@Module({
  providers: [
    { provide: RATE_LIMIT_STORE, useClass: MemoryRateLimitStore },
    { provide: APP_GUARD, useClass: StrictRateLimitGuard },
  ],
  exports: [RATE_LIMIT_STORE],
})
export class SecurityModule {}
