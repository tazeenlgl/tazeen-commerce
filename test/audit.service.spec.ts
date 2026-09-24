import { AuditService } from '../src/auth/audit/audit.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuditService', () => {
  let prisma: { audit_logs: { create: jest.Mock } };
  let service: AuditService;

  beforeEach(() => {
    prisma = { audit_logs: { create: jest.fn().mockResolvedValue({}) } };
    service = new AuditService(prisma as unknown as PrismaService);
  });

  it('writes a row with the given user, action, entity and metadata', async () => {
    await service.record({
      userId: 'user-1',
      action: 'auth.login.success',
      entityType: 'user',
      entityId: 'user-1',
      metadata: { ip: '127.0.0.1' },
    });

    expect(prisma.audit_logs.create).toHaveBeenCalledTimes(1);
    const data = prisma.audit_logs.create.mock.calls[0][0].data;
    expect(data.user_id).toBe('user-1');
    expect(data.action).toBe('auth.login.success');
    expect(data.entity_type).toBe('user');
    expect(data.entity_id).toBe('user-1');
    expect(data.metadata).toEqual({ ip: '127.0.0.1' });
    expect(typeof data.id).toBe('string');
  });

  it('writes a null user_id for unattributable events (e.g. failed login for an unknown phone)', async () => {
    await service.record({ userId: null, action: 'auth.login.failure' });

    const data = prisma.audit_logs.create.mock.calls[0][0].data;
    expect(data.user_id).toBeNull();
  });

  it('never throws when the database write fails (audit must not break the request it accompanies)', async () => {
    prisma.audit_logs.create.mockRejectedValue(new Error('connection refused'));

    await expect(
      service.record({ userId: 'user-1', action: 'auth.login.success' }),
    ).resolves.toBeUndefined();
  });

  it('does not accept password/token fields as first-class columns (metadata is caller-controlled; callers must not pass secrets)', async () => {
    await service.record({
      userId: 'user-1',
      action: 'auth.login.success',
      metadata: { ip: '127.0.0.1' },
    });

    const data = prisma.audit_logs.create.mock.calls[0][0].data;
    expect(JSON.stringify(data)).not.toMatch(/password|session_hash|cookie/i);
  });
});
