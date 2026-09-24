import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from '../src/auth/permissions/permission.guard';
import { PermissionsService } from '../src/auth/permissions/permissions.service';
import { AuditService } from '../src/auth/audit/audit.service';

function makeContext(authSession: unknown) {
  const request = { authSession, method: 'POST', originalUrl: '/api/probe' };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
  } as unknown as ExecutionContext;
}

describe('PermissionGuard', () => {
  let reflector: Reflector;
  let permissionsService: { getPermissionCodes: jest.Mock };
  let auditService: { record: jest.Mock };
  let guard: PermissionGuard;

  beforeEach(() => {
    reflector = new Reflector();
    permissionsService = { getPermissionCodes: jest.fn() };
    auditService = { record: jest.fn().mockResolvedValue(undefined) };
    guard = new PermissionGuard(
      reflector,
      permissionsService as unknown as PermissionsService,
      auditService as unknown as AuditService,
    );
  });

  it('allows the request when no permission metadata is present', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = makeContext({ user_id: 'u1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(permissionsService.getPermissionCodes).not.toHaveBeenCalled();
  });

  it('allows the request when the user has the required permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.read']);
    permissionsService.getPermissionCodes.mockResolvedValue(new Set(['product.read']));
    const ctx = makeContext({ user_id: 'u1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(permissionsService.getPermissionCodes).toHaveBeenCalledTimes(1);
    expect(permissionsService.getPermissionCodes).toHaveBeenCalledWith('u1');
  });

  it('throws ForbiddenException (403) when the user lacks the required permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.create']);
    permissionsService.getPermissionCodes.mockResolvedValue(new Set(['product.read']));
    const ctx = makeContext({ user_id: 'u1' });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('audits a denied permission check with user attribution and no sensitive data', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.create']);
    permissionsService.getPermissionCodes.mockResolvedValue(new Set(['product.read']));
    const ctx = makeContext({ user_id: 'u1' });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);

    expect(auditService.record).toHaveBeenCalledTimes(1);
    const event = auditService.record.mock.calls[0][0];
    expect(event.userId).toBe('u1');
    expect(event.action).toBe('authz.permission.denied');
    expect(JSON.stringify(event)).not.toMatch(/password|token|cookie|secret/i);
  });

  it('does not audit a successful permission check', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.read']);
    permissionsService.getPermissionCodes.mockResolvedValue(new Set(['product.read']));
    const ctx = makeContext({ user_id: 'u1' });

    await guard.canActivate(ctx);

    expect(auditService.record).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException (401) when there is no authSession', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.read']);
    const ctx = makeContext(undefined);

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(permissionsService.getPermissionCodes).not.toHaveBeenCalled();
  });

  it('performs exactly one permission lookup regardless of how many codes are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product.read', 'product.create']);
    permissionsService.getPermissionCodes.mockResolvedValue(new Set(['product.create']));
    const ctx = makeContext({ user_id: 'u1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(permissionsService.getPermissionCodes).toHaveBeenCalledTimes(1);
  });
});
