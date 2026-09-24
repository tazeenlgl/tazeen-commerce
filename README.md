# Tazeen Commerce Backend

Foundation for the Tazeen Commerce Platform, one backend for **POS Web**, **Customer Android App**, **Ecommerce** and **Engagement**.

Stack: NestJS 11, TypeScript, PostgreSQL + Prisma (planned).

> **Legacy POS data has NOT been migrated.** The database holds only the new foundation tables and no data.
> **`pos_db` is unrelated and must never be touched by this project.** This backend uses only `tazeen_pos_db`.

## Architecture

- `src/main.ts`, bootstrap (JSON logger, listen). `src/setup-app.ts` holds the shared pipeline used by both the app and tests: `/api` prefix, URI versioning (`/api/v1/...`), helmet, 1 MB body limit, CORS allow-list, global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), global JSON error filter, shutdown hooks.
- `src/config/`, env loading and validation.
- `src/common/`, filters (error shape `{statusCode, error, message, path, timestamp}`), JSON-line logger, request logging.
- `src/health/`, `GET /api/health` (unversioned, no DB).
- `src/modules/`, empty skeleton modules (no logic yet): identity, auth, customers, catalog, products, variants, sku, inventory, locations, sales, invoices, orders, payments, wallet, notifications, engagement, audit. All are registered via `domain.module.ts`.
- Reserved extension points (not implemented): rate limiting, connection protection, request timeouts, abuse protection, Redis, background jobs. See the comment in `app.module.ts`.

## Local development

```bash
cp .env.example .env   # fill values locally; never commit .env
npm install
npm run start:dev
npm test
npm run typecheck
npm run build
```

## Environment variables

| Name | Purpose |
|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` |
| `PORT` | HTTP port (default 3000) |
| `CORS_ORIGINS` | Comma-separated allowed origins (none allowed if empty) |
| `JWT_SECRET` | Reserved for auth (not used yet); required when `NODE_ENV=production` |
| `DATABASE_URL` | PostgreSQL connection string for `tazeen_pos_db` (user `tazeen_pos_app`). Secret: keep it in `.env` only |
| `TRUST_PROXY` | Trusted proxy hops (`false`, or a number such as `1`). Required for correct per-client limits behind a reverse proxy |
| `RATE_LIMIT_WINDOW_SEC` / `RATE_LIMIT_MAX` | Global per-client limit (default 120 per 60 s) |
| `RATE_LIMIT_STRICT_WINDOW_SEC` / `RATE_LIMIT_STRICT_MAX` | Default for `@StrictRateLimit()` routes (default 10 per 60 s) |
| `BODY_LIMIT` | Max JSON/urlencoded body size (default `100kb`) |
| `REQUEST_TIMEOUT_MS` | Responds 503 after this long (default 30000) |
| `MAX_CONCURRENT_REQUESTS` | In-flight cap per process; excess gets 503 (default 200) |
| `MAX_CONNECTIONS` | Socket cap per process (default 1000) |

## Database (Prisma)

- Database: `tazeen_pos_db`. Application user: `tazeen_pos_app`.
- Set `DATABASE_URL` in `.env` (see `.env.example`; the password there is a placeholder). Confirm it ends in `/tazeen_pos_db` before running any migration.
- Schema: `prisma/schema.prisma`. IDs are UUIDv7, independent of phone, SKU, invoice or serial numbers.
- Currently modelled: **Supplier only** (`suppliers`, `supplier_addresses`, `supplier_bank_accounts`), migration `20260921200000_supplier_foundation`. Fields and enum values mirror the current Supplier screen.
- The earlier Customer/Product/Variant/SKU/Location/Inventory foundation is an **unapproved draft that was never applied**. It is parked in `prisma/drafts/` so `migrate deploy` and the client ignore it.
- Note: URL-encode special characters in the `DATABASE_URL` password (`/` -> `%2F`, `+` -> `%2B`, `=` -> `%3D`).

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:status
npm run prisma:migrate:deploy   # apply committed migrations (use this for tazeen_pos_db)
npm run prisma:migrate:dev      # only to create a new migration in development
```

The app connects to PostgreSQL lazily. `GET /api/health` never touches the database; `GET /api/health/ready` runs `SELECT 1`.

## Health endpoint

`GET /api/health` returns `{"status":"ok","uptime":...,"timestamp":"..."}`. It does not touch the database.

## API security and abuse protection

Order of checks (all before body parsing, routing and business logic): helmet, concurrency cap (503), request timeout (503), global per-client rate limit (429, with `Retry-After` and `RateLimit-*` headers), then body-size limit (413). Validation and the JSON error filter run after that. `/api/health` is exempt from the rate and concurrency limits so probes keep working.

Sensitive routes (login, OTP, password reset) opt in to a stricter limit:

```ts
@StrictRateLimit()                          // uses RATE_LIMIT_STRICT_*
@StrictRateLimit({ limit: 5, windowSec: 300 })
```

Errors always use `{statusCode, error, message, path, timestamp}`. Stack traces are logged server-side only.

### Limitations (read before deploying)

- **Rate limiting is in-memory and per-process.** It is not distributed protection. With several API instances each keeps its own counters (effective limit = N x configured), and counters reset on restart.
- Replacing it: implement the `RateLimitStore` interface (`src/security/rate-limit-store.ts`) with Redis and bind it to `RATE_LIMIT_STORE` in `security.module.ts`. Middleware and guard need no changes. Redis is not added yet.
- The timeout frees the client but cannot cancel a handler already running.
- Set `TRUST_PROXY` to the real proxy hop count. If it is wrong, every client can look like the proxy IP (one shared limit), or clients can spoof `X-Forwarded-For`.

### Production recommendations

- Run behind a reverse proxy / edge (TLS, connection and bandwidth limits, WAF/DDoS protection) and keep the API port private. This app only covers the application layer.
- Keep `BODY_LIMIT` as low as the endpoints allow; raise it per-route only when needed (e.g. uploads).
- Use a low `RATE_LIMIT_STRICT_MAX` (about 5 to 10 per minute) on auth endpoints.
- Move to a shared Redis store before running more than one instance.
