import { PermissionsService } from '../src/auth/permissions/permissions.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PermissionsService', () => {
  let prisma: { role_permissions: { findMany: jest.Mock } };
  let service: PermissionsService;

  beforeEach(() => {
    prisma = { role_permissions: { findMany: jest.fn() } };
    service = new PermissionsService(prisma as unknown as PrismaService);
  });

  it('queries role_permissions filtered by user via user_roles -> roles', async () => {
    prisma.role_permissions.findMany.mockResolvedValue([]);

    await service.getPermissionCodes('user-1');

    expect(prisma.role_permissions.findMany).toHaveBeenCalledWith({
      where: { roles: { user_roles: { some: { user_id: 'user-1' } } } },
      select: { permissions: { select: { code: true } } },
    });
  });

  it('returns the union of permission codes across multiple roles', async () => {
    prisma.role_permissions.findMany.mockResolvedValue([
      { permissions: { code: 'product.read' } },
      { permissions: { code: 'supplier.read' } },
    ]);

    const codes = await service.getPermissionCodes('user-1');

    expect(codes).toEqual(new Set(['product.read', 'supplier.read']));
  });

  it('deduplicates a permission granted by more than one role', async () => {
    prisma.role_permissions.findMany.mockResolvedValue([
      { permissions: { code: 'product.read' } },
      { permissions: { code: 'product.read' } },
    ]);

    const codes = await service.getPermissionCodes('user-1');

    expect(codes).toEqual(new Set(['product.read']));
    expect(codes.size).toBe(1);
  });

  it('returns an empty set for a user with no roles', async () => {
    prisma.role_permissions.findMany.mockResolvedValue([]);

    const codes = await service.getPermissionCodes('user-with-no-roles');

    expect(codes).toEqual(new Set());
    expect(codes.size).toBe(0);
  });
});
