import { OnModuleDestroy } from '@nestjs/common';

export interface RateLimitHit {
  count: number;
  resetAt: number; // epoch ms
}

/**
 * Storage contract for rate limiting. The in-memory implementation is
 * per-process only; a Redis-backed class implementing this interface
 * (e.g. INCR + PEXPIRE) can be bound to RATE_LIMIT_STORE later without
 * changing middleware or guards.
 */
export interface RateLimitStore {
  hit(key: string, windowMs: number): Promise<RateLimitHit>;
}

export const RATE_LIMIT_STORE = Symbol('RATE_LIMIT_STORE');

export class MemoryRateLimitStore implements RateLimitStore, OnModuleDestroy {
  private readonly entries = new Map<string, RateLimitHit>();
  private readonly timer: NodeJS.Timeout;

  constructor(private readonly maxKeys = 100_000) {
    this.timer = setInterval(() => this.purge(), 60_000);
    this.timer.unref();
  }

  async hit(key: string, windowMs: number): Promise<RateLimitHit> {
    const now = Date.now();
    let e = this.entries.get(key);
    if (!e || e.resetAt <= now) {
      if (this.entries.size >= this.maxKeys) this.purge();
      e = { count: 0, resetAt: now + windowMs };
      this.entries.set(key, e);
    }
    e.count += 1;
    return { count: e.count, resetAt: e.resetAt };
  }

  private purge() {
    const now = Date.now();
    for (const [k, v] of this.entries) if (v.resetAt <= now) this.entries.delete(k);
    // still over the cap: drop oldest insertions so memory stays bounded
    while (this.entries.size >= this.maxKeys) {
      const first = this.entries.keys().next().value;
      if (first === undefined) break;
      this.entries.delete(first);
    }
  }

  onModuleDestroy() {
    clearInterval(this.timer);
    this.entries.clear();
  }
}
