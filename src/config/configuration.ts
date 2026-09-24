export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  databaseUrl?: string;
  bodyLimit: string;
  security: SecurityConfig;
}

export interface SecurityConfig {
  trustProxy: boolean | number;
  rateLimitWindowSec: number;
  rateLimitMax: number;
  strictWindowSec: number;
  strictMax: number;
  requestTimeoutMs: number;
  maxConcurrentRequests: number;
  maxConnections: number;
}

const int = (v: unknown, d: number) => {
  const n = Number(v ?? d);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : d;
};

function parseTrustProxy(v: unknown): boolean | number {
  if (v === undefined || v === '' || v === 'false') return false;
  if (v === 'true') return true;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : false;
}

export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
  const nodeEnv = String(env.NODE_ENV ?? 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
  }
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }
  return { ...env, NODE_ENV: nodeEnv, PORT: port };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || undefined, // reserved; unused until DB task
  bodyLimit: process.env.BODY_LIMIT || '100kb',
  security: {
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
    rateLimitWindowSec: int(process.env.RATE_LIMIT_WINDOW_SEC, 60),
    rateLimitMax: int(process.env.RATE_LIMIT_MAX, 120),
    strictWindowSec: int(process.env.RATE_LIMIT_STRICT_WINDOW_SEC, 60),
    strictMax: int(process.env.RATE_LIMIT_STRICT_MAX, 10),
    requestTimeoutMs: int(process.env.REQUEST_TIMEOUT_MS, 30000),
    maxConcurrentRequests: int(process.env.MAX_CONCURRENT_REQUESTS, 200),
    maxConnections: int(process.env.MAX_CONNECTIONS, 1000),
  },
});
