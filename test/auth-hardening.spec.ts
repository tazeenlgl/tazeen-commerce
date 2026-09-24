import { Controller, Get, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { PrismaService } from '../src/prisma/prisma.service';
import { PasswordService } from '../src/auth/password.service';
import { getAuthToken } from '../src/auth/auth-cookie';
import { SessionAuthGuard } from '../src/auth/session-auth.guard';

describe('getAuthToken (cookie parsing hardening)', () => {
  it('returns null instead of throwing on a malformed percent-encoded cookie value', () => {
    const req = { headers: { cookie: 'tazeen_session=%E0%A4%A' } } as unknown as Parameters<typeof getAuthToken>[0];

    expect(() => getAuthToken(req)).not.toThrow();
    expect(getAuthToken(req)).toBeNull();
  });

  it('still decodes a well-formed cookie value', () => {
    const req = { headers: { cookie: 'tazeen_session=abc123' } } as unknown as Parameters<typeof getAuthToken>[0];
    expect(getAuthToken(req)).toBe('abc123');
  });
});

@Controller('hardening-probe')
@UseGuards(SessionAuthGuard)
class HardeningProbeController {
  @Get()
  get() {
    return { ok: true };
  }
}

describe('SessionAuthGuard never returns 500 for a malformed session cookie', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [HardeningProbeController],
    }).compile();
    app = mod.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  it('returns a clean 401 (not 500) for an unparseable cookie value', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/hardening-probe')
      .set('Cookie', 'tazeen_session=%E0%A4%A');

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('still returns 401 (not 500) with no cookie at all', async () => {
    await request(app.getHttpServer()).get('/api/hardening-probe').expect(401);
  });
});

describe('login: account-enumeration timing hardening', () => {
  let app: NestExpressApplication;
  let prisma: { users: { findUnique: jest.Mock } };
  let passwordService: { verifyPassword: jest.Mock };

  beforeAll(async () => {
    prisma = { users: { findUnique: jest.fn() } };
    passwordService = { verifyPassword: jest.fn().mockResolvedValue(false) };

    const mod = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(PasswordService)
      .useValue(passwordService)
      .compile();

    app = mod.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterEach(() => jest.clearAllMocks());
  afterAll(() => app.close());

  it('still runs a password verification for an unknown phone number (same 401, no fast-path)', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: '9999999999', password: 'whatever1' });

    expect(res.status).toBe(401);
    expect(passwordService.verifyPassword).toHaveBeenCalledTimes(1);
  });

  it('still runs a password verification for an inactive account', async () => {
    prisma.users.findUnique.mockResolvedValue({
      id: 'u1',
      phone: '9999999999',
      password_hash: 'hash',
      status: 'Inactive',
      full_name: 'X',
    });

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: '9999999999', password: 'whatever1' });

    expect(res.status).toBe(401);
    expect(passwordService.verifyPassword).toHaveBeenCalledTimes(1);
  });

  it('runs exactly one password verification for an active user with a wrong password', async () => {
    prisma.users.findUnique.mockResolvedValue({
      id: 'u1',
      phone: '9999999999',
      password_hash: 'hash',
      status: 'Active',
      full_name: 'X',
    });

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: '9999999999', password: 'whatever1' });

    expect(res.status).toBe(401);
    expect(passwordService.verifyPassword).toHaveBeenCalledTimes(1);
  });
});

describe('logout: no unnecessary last_seen_at write', () => {
  let app: NestExpressApplication;
  let prisma: {
    sessions: { findUnique: jest.Mock; update: jest.Mock; updateMany: jest.Mock };
    audit_logs: { create: jest.Mock };
  };

  beforeAll(async () => {
    prisma = {
      sessions: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      audit_logs: { create: jest.fn().mockResolvedValue({}) },
    };

    const mod = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = mod.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterEach(() => jest.clearAllMocks());
  afterAll(() => app.close());

  it('revokes the session and audits it without touching last_seen_at', async () => {
    prisma.sessions.findUnique.mockResolvedValue({
      id: 'session-1',
      user_id: 'user-1',
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });

    const res = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', 'tazeen_session=some-token');

    expect(res.status).toBe(201);
    expect(prisma.sessions.updateMany).toHaveBeenCalledTimes(1); // revoke
    expect(prisma.sessions.update).not.toHaveBeenCalled(); // no last_seen_at bump
    expect(prisma.audit_logs.create).toHaveBeenCalledTimes(1);
    expect(prisma.audit_logs.create.mock.calls[0][0].data.user_id).toBe('user-1');
  });
});
