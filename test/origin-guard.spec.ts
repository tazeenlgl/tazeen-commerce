import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IsString } from 'class-validator';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { PrismaService } from '../src/prisma/prisma.service';

class EchoDto {
  @IsString() name: string;
}

@Controller('origin-probe')
class OriginProbeController {
  @Get()
  get() {
    return { ok: true };
  }

  @Post()
  post(@Body() dto: EchoDto) {
    return { ok: true, name: dto.name };
  }

  @Patch()
  patch() {
    return { ok: true };
  }

  @Delete()
  remove() {
    return { ok: true };
  }
}

async function makeApp(env: Record<string, string>) {
  delete process.env.CORS_ORIGINS;
  Object.assign(process.env, env);
  const mod = await Test.createTestingModule({ imports: [AppModule], controllers: [OriginProbeController] }).compile();
  const app = mod.createNestApplication<NestExpressApplication>();
  setupApp(app);
  await app.init();
  return app;
}

describe('CSRF / Origin guard', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await makeApp({ CORS_ORIGINS: 'https://pos.tazeen.in' });
  });

  afterAll(async () => {
    await app.close();
    delete process.env.CORS_ORIGINS;
  });

  it('allows a same-origin POST (Origin matches request Host)', async () => {
    await request(app.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'app.internal')
      .set('Origin', 'http://app.internal')
      .send({ name: 'x' })
      .expect(201, { ok: true, name: 'x' });
  });

  it('allows a POST from a configured trusted origin regardless of Host', async () => {
    await request(app.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'app.internal')
      .set('Origin', 'https://pos.tazeen.in')
      .send({ name: 'x' })
      .expect(201);
  });

  it('allows a state-changing request with no Origin header (policy: missing Origin permitted)', async () => {
    await request(app.getHttpServer())
      .post('/api/origin-probe')
      .send({ name: 'x' })
      .expect(201);
  });

  it('rejects a POST from a wrong/untrusted Origin with 403', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'app.internal')
      .set('Origin', 'https://evil.example.com')
      .send({ name: 'x' });

    expect(res.status).toBe(403);
    expect(res.body.statusCode).toBe(403);
  });

  it('rejects a forged cross-origin PATCH the same way', async () => {
    await request(app.getHttpServer())
      .patch('/api/origin-probe')
      .set('Origin', 'https://evil.example.com')
      .expect(403);
  });

  it('rejects a forged cross-origin DELETE the same way', async () => {
    await request(app.getHttpServer())
      .delete('/api/origin-probe')
      .set('Origin', 'https://evil.example.com')
      .expect(403);
  });

  it('never blocks GET, regardless of Origin', async () => {
    await request(app.getHttpServer())
      .get('/api/origin-probe')
      .set('Origin', 'https://evil.example.com')
      .expect(200, { ok: true });
  });

  it('never blocks HEAD, regardless of Origin', async () => {
    await request(app.getHttpServer())
      .head('/api/origin-probe')
      .set('Origin', 'https://evil.example.com')
      .expect(200);
  });

  it('never blocks OPTIONS, regardless of Origin', async () => {
    await request(app.getHttpServer())
      .options('/api/origin-probe')
      .set('Origin', 'https://evil.example.com')
      .then((res) => expect(res.status).not.toBe(403));
  });

  it('still allows /api/health with a hostile Origin (exempt path, GET only anyway)', async () => {
    await request(app.getHttpServer()).get('/api/health').set('Origin', 'https://evil.example.com').expect(200);
  });
});

describe('CSRF / Origin guard behind a TLS-terminating reverse proxy', () => {
  // Simulates production: nginx terminates TLS and forwards X-Forwarded-Proto: https, but the
  // app itself (supertest here) only ever sees a plain HTTP connection. The browser's Origin
  // header is always https for a real HTTPS site, so this is the exact scheme mismatch that
  // req.protocol-based same-origin comparison would get wrong if TRUST_PROXY were misconfigured.
  let appTrustProxyOn: NestExpressApplication;
  let appTrustProxyOff: NestExpressApplication;

  beforeAll(async () => {
    appTrustProxyOn = await makeApp({ CORS_ORIGINS: '', TRUST_PROXY: '1' });
    appTrustProxyOff = await makeApp({ CORS_ORIGINS: '', TRUST_PROXY: 'false' });
  });

  afterAll(async () => {
    await appTrustProxyOn.close();
    await appTrustProxyOff.close();
    delete process.env.CORS_ORIGINS;
    delete process.env.TRUST_PROXY;
  });

  it('accepts a same-host HTTPS Origin over a plain HTTP connection when TRUST_PROXY=1 (correct prod config)', async () => {
    await request(appTrustProxyOn.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'pos.tazeen.in')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'https://pos.tazeen.in')
      .send({ name: 'x' })
      .expect(201);
  });

  it('still accepts the same request when TRUST_PROXY is left off/misconfigured (the bug being fixed)', async () => {
    await request(appTrustProxyOff.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'pos.tazeen.in')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'https://pos.tazeen.in')
      .send({ name: 'x' })
      .expect(201);
  });

  it('still rejects a genuinely different host even with matching scheme, proxy on or off', async () => {
    await request(appTrustProxyOn.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'pos.tazeen.in')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'https://evil.example.com')
      .send({ name: 'x' })
      .expect(403);

    await request(appTrustProxyOff.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'pos.tazeen.in')
      .set('Origin', 'https://evil.example.com')
      .send({ name: 'x' })
      .expect(403);
  });

  it('rejects an Origin that is not a parseable URL (fail-closed, not treated as same-origin)', async () => {
    await request(appTrustProxyOff.getHttpServer())
      .post('/api/origin-probe')
      .set('Host', 'pos.tazeen.in')
      .set('Origin', 'not-a-valid-origin')
      .send({ name: 'x' })
      .expect(403);
  });
});

describe('CSRF / Origin guard on auth endpoints', () => {
  let app: NestExpressApplication;
  let prisma: { users: { findUnique: jest.Mock } };

  beforeAll(async () => {
    delete process.env.CORS_ORIGINS;
    Object.assign(process.env, { CORS_ORIGINS: 'https://pos.tazeen.in' });

    prisma = { users: { findUnique: jest.fn().mockResolvedValue(null) } };

    const mod = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = mod.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.CORS_ORIGINS;
  });

  it('blocks a cross-origin login attempt with 403 before it reaches the database', async () => {
    prisma.users.findUnique.mockClear();

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example.com')
      .send({ phone: '9999999999', password: 'password123' });

    expect(res.status).toBe(403);
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('lets a same-origin login attempt reach the handler (fails 401 on bad credentials, not 403)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Host', 'app.internal')
      .set('Origin', 'http://app.internal')
      .send({ phone: '9999999999', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('blocks a cross-origin logout attempt with 403', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Origin', 'https://evil.example.com')
      .expect(403);
  });

  it('allows a same-origin logout attempt to reach the handler', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Host', 'app.internal')
      .set('Origin', 'http://app.internal');

    expect(res.status).not.toBe(403);
  });
});
