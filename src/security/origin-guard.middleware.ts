import { Request, Response } from 'express';
import { sendError } from '../common/errors/error-response';
import { isHealthPath } from './rate-limit';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Defense-in-depth CSRF guard for a same-origin production deployment (pos.tazeen.in serves
 * both the app and /api). The session cookie is already SameSite=strict, which blocks
 * cross-site browsers from sending it; this middleware adds an explicit Origin check for
 * state-changing requests so a same-site-but-different-origin page (e.g. another app on a
 * sibling subdomain) can't ride the cookie either.
 *
 * Policy:
 * - Safe methods (GET/HEAD/OPTIONS) are never checked: CSRF only matters for state changes.
 * - No Origin header: allowed. Real browsers attach Origin to same-origin fetch/XHR state-
 *   changing requests; a missing header here is either a same-origin plain form post (which
 *   SameSite=strict already denies the cookie for cross-site) or a non-browser API client.
 * - Origin present: its *host* must equal this request's own Host header, OR the full Origin
 *   must be in the explicit trustedOrigins allowlist (CORS_ORIGINS). Anything else, or an
 *   Origin that doesn't even parse as a URL, is rejected with 403.
 *
 * Same-origin is compared by host only, not scheme+host: behind the production reverse proxy
 * (nginx terminates TLS; the app sees a plain HTTP connection), req.protocol reflects
 * X-Forwarded-Proto only when TRUST_PROXY is set correctly, and getting that wrong must never
 * silently turn into rejecting every legitimate same-origin HTTPS request. The Host header
 * nginx forwards is reliable either way, and the scheme itself carries no CSRF-relevant
 * information the Host doesn't already cover — a cross-origin attacker's page has neither the
 * right host nor the right scheme, so checking host alone loses no real protection.
 */
export function createOriginGuardMiddleware(trustedOrigins: readonly string[]) {
  const allowlist = new Set(trustedOrigins);

  return (req: Request, res: Response, next: () => void) => {
    if (isHealthPath(req) || SAFE_METHODS.has(req.method)) {
      return next();
    }

    const origin = req.headers.origin;

    if (typeof origin !== 'string' || origin.length === 0) {
      return next();
    }

    if (allowlist.has(origin)) {
      return next();
    }

    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      // Not a parseable Origin value at all: never treat as same-origin.
      return sendError(req, res, 403, 'Forbidden', 'Cross-origin request blocked');
    }

    if (originHost === req.get('host')) {
      return next();
    }

    return sendError(req, res, 403, 'Forbidden', 'Cross-origin request blocked');
  };
}
