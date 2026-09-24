import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { PrismaService } from '../src/prisma/prisma.service';
import { PasswordService } from '../src/auth/password.service';

describe('audit logging for authentication events', () => {
  let app: NestExpressApplication;
  let prisma: {
    users: { findUnique: jest.Mock };
    sessions: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock; updateMany: jest.Mock };
    audit_logs: { create: jest.Mock };
  };

  const ACTIVE_USER = {
    id: 'user-1',
    phone: '9999999999',
    password_hash: 'hashed',
    status: 'Active',
    full_name: 'Test User',
  };

  beforeAll(async () => {
    prisma = {
      users: { findUnique: jest.fn() },
      sessions: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      audit_logs: { create: jest.fn().mockResolvedValue({}) },
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(PasswordService)
      .useValue({ verifyPassword: jest.fn().mockResolvedValue(true) })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterEach(() => jest.clearAllMocks());
  afterAll(() => app.close());

  it('records auth.login.success with user attribution and no password/token', async () => {
    prisma.users.findUnique.mockResolvedValue(ACTIVE_USER);

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: '9999999999', password: 'password123' });

    expect(res.status).toBe(201);
    expect(prisma.audit_logs.create).toHaveBeenCalledTimes(1);

    const data = prisma.audit_logs.create.mock.calls[0][0].data;
    expect(data.action).toBe('auth.login.success');
    expect(data.user_id).toBe('user-1');
    expect(JSON.stringify(data)).not.toMatch(/password123|hashed|session_hash/i);
  });

  it('records auth.login.failure (no user attribution) when credentials are wrong, without leaking the password', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: '8888888888', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(prisma.audit_logs.create).toHaveBeenCalledTimes(1);

    const data = prisma.audit_logs.create.mock.calls[0][0].data;
    expect(data.action).toBe('auth.login.failure');
    expect(data.user_id).toBeNull();
    expect(JSON.stringify(data)).not.toMatch(/wrongpassword/i);
  });

  it('still returns 401 for bad credentials even if the audit write itself fails', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.audit_logs.create.mockRejectedValueOnce(new Error('db down'));

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: '8888888888', password: 'wrongpassword' })
      .expect(401);
  });

  it('still logs a user in successfully even if the audit write fails', async () => {
    prisma.users.findUnique.mockResolvedValue(ACTIVE_USER);
    prisma.audit_logs.create.mockRejectedValueOnce(new Error('db down'));

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: '9999999999', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.id).toBe('user-1');
  });

  it('records auth.logout with the acting user when a valid session exists', async () => {
    prisma.sessions.findUnique.mockResolvedValue({
      id: 'session-1',
      user_id: 'user-1',
      expires_at: new Date(Date.now() + 60_000),
      revoked_at: null,
      users: { id: 'user-1', phone: '9999999999', full_name: 'Test User', status: 'Active' },
    });

    const res = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', 'tazeen_session=some-token');

    expect(res.status).toBe(201);
    expect(prisma.audit_logs.create).toHaveBeenCalledTimes(1);

    const data = prisma.audit_logs.create.mock.calls[0][0].data;
    expect(data.action).toBe('auth.logout');
    expect(data.user_id).toBe('user-1');
    expect(JSON.stringify(data)).not.toMatch(/some-token/i);
  });

  it('does not write an audit row for logout with no session cookie', async () => {
    await request(app.getHttpServer()).post('/api/auth/logout').expect(201);

    expect(prisma.audit_logs.create).not.toHaveBeenCalled();
  });
});
