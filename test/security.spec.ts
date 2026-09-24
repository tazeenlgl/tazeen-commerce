import { Body, Controller, Get, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IsString } from 'class-validator';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { StrictRateLimit } from '../src/security/rate-limit.decorator';

class EchoDto {
  @IsString() name: string;
}

let handlerCalls = 0;

@Controller('probe')
class ProbeController {
  @Post('echo')
  echo(@Body() dto: EchoDto) {
    handlerCalls++;
    return { name: dto.name };
  }
  @Get('strict')
  @StrictRateLimit({ limit: 2, windowSec: 60 })
  strict() {
    return { ok: true };
  }
  @Get('slow')
  async slow() {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true };
  }
}

const ENV_KEYS = ['RATE_LIMIT_MAX', 'BODY_LIMIT', 'REQUEST_TIMEOUT_MS', 'MAX_CONCURRENT_REQUESTS'];

async function makeApp(env: Record<string, string>) {
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, env);
  const mod = await Test.createTestingModule({ imports: [AppModule], controllers: [ProbeController] }).compile();
  const app = mod.createNestApplication<NestExpressApplication>({ bodyParser: false });
  setupApp(app);
  await app.init();
  return app;
}

afterAll(() => {
  for (const k of ENV_KEYS) delete process.env[k];
});

describe('global rate limit', () => {
  let app: NestExpressApplication;
  beforeAll(async () => (app = await makeApp({ RATE_LIMIT_MAX: '3' })));
  afterAll(() => app.close());

  it('allows requests within limit and returns 429 with retry info beyond it', async () => {
    const s = () => request(app.getHttpServer());
    for (let i = 0; i < 3; i++) {
      const r = await s().get('/api/nope').expect(404);
      expect(r.headers['ratelimit-limit']).toBe('3');
    }
    const r = await s().get('/api/nope').expect(429);
    expect(Number(r.headers['retry-after'])).toBeGreaterThan(0);
    expect(r.body).toEqual(expect.objectContaining({ statusCode: 429, error: 'Too Many Requests', path: '/api/nope' }));
    expect(JSON.stringify(r.body)).not.toMatch(/stack|node_modules/);
  });

  it('health stays available while limited', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });

  it('rejected requests never reach the handler', async () => {
    handlerCalls = 0;
    await request(app.getHttpServer()).post('/api/probe/echo').send({ name: 'x' }).expect(429);
    expect(handlerCalls).toBe(0);
  });
});

describe('strict rate limit (decorator)', () => {
  let app: NestExpressApplication;
  beforeAll(async () => (app = await makeApp({})));
  afterAll(() => app.close());

  it('applies stricter limit to decorated route only', async () => {
    const s = () => request(app.getHttpServer());
    await s().get('/api/probe/strict').expect(200);
    await s().get('/api/probe/strict').expect(200);
    const r = await s().get('/api/probe/strict').expect(429);
    expect(r.headers['retry-after']).toBeDefined();
    expect(r.body.statusCode).toBe(429);
    await s().get('/api/health').expect(200);
  });
});

describe('body limits and validation', () => {
  let app: NestExpressApplication;
  beforeAll(async () => (app = await makeApp({ BODY_LIMIT: '1kb' })));
  afterAll(() => app.close());

  it('rejects oversized body with 413 JSON before the handler', async () => {
    handlerCalls = 0;
    const r = await request(app.getHttpServer())
      .post('/api/probe/echo')
      .send({ name: 'a'.repeat(5000) })
      .expect(413);
    expect(r.body).toEqual(expect.objectContaining({ statusCode: 413, message: 'Request body too large' }));
    expect(handlerCalls).toBe(0);
  });

  it('malformed JSON gives 400 JSON error', async () => {
    const r = await request(app.getHttpServer())
      .post('/api/probe/echo')
      .set('content-type', 'application/json')
      .send('{bad')
      .expect(400);
    expect(r.body.statusCode).toBe(400);
  });

  it('validation still works (whitelist / forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer()).post('/api/probe/echo').send({ name: 'ok' }).expect(201);
    const r = await request(app.getHttpServer()).post('/api/probe/echo').send({ name: 'ok', extra: 1 }).expect(400);
    expect(r.body.error).toBe('Bad Request');
    expect(r.body.message).toEqual(expect.arrayContaining([expect.stringContaining('extra')]));
  });
});

describe('request timeout', () => {
  let app: NestExpressApplication;
  beforeAll(async () => (app = await makeApp({ REQUEST_TIMEOUT_MS: '100' })));
  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 400)); // let the slow handler finish
    await app.close();
  });

  it('returns 503 JSON when a request exceeds the timeout', async () => {
    const r = await request(app.getHttpServer()).get('/api/probe/slow').expect(503);
    expect(r.body).toEqual(expect.objectContaining({ statusCode: 503, message: 'Request timed out' }));
  });
});

describe('concurrency limit', () => {
  let app: NestExpressApplication;
  beforeAll(async () => (app = await makeApp({ MAX_CONCURRENT_REQUESTS: '1' })));
  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 400));
    await app.close();
  });

  it('sheds excess in-flight requests with 503 + Retry-After', async () => {
    const s = () => request(app.getHttpServer());
    const slow = s().get('/api/probe/slow').then((r) => r);
    await new Promise((r) => setTimeout(r, 50));
    const r = await s().get('/api/probe/strict').expect(503);
    expect(r.headers['retry-after']).toBe('1');
    await request(app.getHttpServer()).get('/api/health').expect(200);
    await slow;
  });
});
